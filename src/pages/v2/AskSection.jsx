import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import {
  init as initWebLLM,
  streamChat,
  interruptGenerate,
  isWebGPUSupported,
} from '../../utils/webllmClient';
import { ASSISTANT_SYSTEM_PROMPT } from '../../data/assistantKnowledge';

const EASE = [0.16, 1, 0.3, 1];

const QUICK = [
  { label: 'Education', q: 'Tell me about your education background' },
  { label: 'Experience', q: 'Tell me about your work experience' },
  { label: 'Projects', q: 'What are your most impressive projects?' },
  { label: 'Skills', q: 'What are your main technical skills?' },
  { label: 'Publications', q: 'Tell me about your research publications' },
];

// Credibility strip. Cyan (--v2-live) is reserved for the single fact that
// carries the "this is running right here, right now" signal, spending it on
// more than one chip would drain the meaning out of the colour.
const TRUST = [
  { label: 'WebGPU', live: false },
  { label: 'On-device inference', live: true },
  { label: 'MLC-AI WebLLM', live: false },
  { label: 'Zero data transfer', live: false },
];

/** Header chip copy + colour tone for whatever the engine is doing right now. */
function engineStatus({ isInitializing, isStreaming, mode }) {
  if (isInitializing) return { label: 'Loading model', tone: 'accent' };
  if (isStreaming) return { label: 'Generating', tone: 'accent' };
  if (mode === 'local') return { label: 'On your GPU', tone: 'live' };
  if (mode === 'server') return { label: 'Hosted fallback', tone: 'neutral' };
  return { label: 'Ready', tone: 'neutral' };
}

/* Chip/die glyph, the section is about silicon, so the mark is silicon. */
function ChipMark({ size = 20 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <rect x="4.5" y="4.5" width="15" height="15" rx="4.5" />
      <rect x="9" y="9" width="6" height="6" rx="1.5" />
      <path d="M9 1.8v2.7M15 1.8v2.7M9 19.5v2.7M15 19.5v2.7M1.8 9h2.7M1.8 15h2.7M19.5 9h2.7M19.5 15h2.7" />
    </svg>
  );
}

/* Three dots with staggered opacity, the "a reply is coming" beat that sits
   between hitting send and the first token landing. */
function TypingDots() {
  return (
    <>
      <span className="ask-sr-only">Generating a reply</span>
      <span className="ask-typing__dot" aria-hidden="true" />
      <span className="ask-typing__dot" aria-hidden="true" />
      <span className="ask-typing__dot" aria-hidden="true" />
    </>
  );
}

function SuggestionChips({ disabled, onPick, className }) {
  return (
    <div className={className}>
      {QUICK.map(({ label, q }) => (
        <button
          key={label}
          type="button"
          onClick={() => !disabled && onPick(q)}
          disabled={disabled}
          className="ask-suggest"
        >
          {label}
        </button>
      ))}
    </div>
  );
}

export default function AskSection() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [mode, setMode] = useState('unknown');

  const [reduceMotion, setReduceMotion] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );

  const gpuSupported = useRef(typeof window !== 'undefined' ? isWebGPUSupported() : false);
  const webLLMReady = useRef(false);
  // Generation counter: every new stream bumps it; stale callbacks compare
  // against their captured value and bail, so a cancelled/superseded stream
  // can never write into a newer bubble (or into an unmounted component).
  const genRef = useRef(0);
  const bottomRef = useRef(null);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onChange = (e) => setReduceMotion(e.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  useEffect(() => {
    if (!gpuSupported.current) setMode('server');
  }, []);

  // Invalidate any in-flight stream on unmount so it can't setState afterwards.
  useEffect(() => {
    const gen = genRef; // stable ref object; .current is a counter, not a node
    return () => {
      gen.current++;
    };
  }, []);

  // Scroll only when a message is added/removed, not on every streamed token,
  // and never on initial mount.
  useEffect(() => {
    if (messages.length === 0) return;
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  const INIT_TIMEOUT_MS = 120000;
  // Generous on purpose: the fallback runs on a free Render instance that
  // spins down when idle, and a cold start alone can take ~45s. Short enough
  // that a genuinely unreachable backend still releases the UI.
  const SERVER_TIMEOUT_MS = 75000;
  const SERVER_CHAT_URL =
    process.env.REACT_APP_BACKEND_URL || 'https://portfolio-backend-wt45.onrender.com/chat';

  const ensureWebLLM = async () => {
    if (webLLMReady.current) return;
    setIsInitializing(true);
    setProgress(0);
    let timeoutId;
    try {
      await Promise.race([
        initWebLLM((p) => setProgress(p)),
        new Promise((_, reject) => {
          timeoutId = setTimeout(
            () => reject(new Error('WebLLM initialization timed out')),
            INIT_TIMEOUT_MS
          );
        }),
      ]);
      webLLMReady.current = true;
      setMode('local');
    } catch (err) {
      gpuSupported.current = false;
      setMode('server');
      throw err;
    } finally {
      clearTimeout(timeoutId);
      setIsInitializing(false);
    }
  };

  const runLocalChat = async (userQ) => {
    const gen = ++genRef.current;
    setIsStreaming(true);
    const history = [];
    for (const m of messages) {
      if (m.role === 'user') history.push({ role: 'user', content: m.text });
      else if (m.role === 'ai') history.push({ role: 'assistant', content: m.text });
    }
    setMessages(p => [...p.filter(m => m.role !== 'loading'), { role: 'ai', text: '' }]);
    let acc = '';
    try {
      await streamChat({
        systemPrompt: ASSISTANT_SYSTEM_PROMPT,
        history,
        userPrompt: userQ,
        onToken: (tok) => {
          if (genRef.current !== gen) return;
          acc += tok;
          setMessages(p => {
            const next = [...p];
            const last = next[next.length - 1];
            if (last?.role === 'ai') next[next.length - 1] = { role: 'ai', text: acc };
            return next;
          });
        },
      });
    } finally {
      if (genRef.current === gen) setIsStreaming(false);
    }
  };

  const runServerChat = async (userQ) => {
    // Without a deadline an unreachable backend leaves the panel showing
    // "Generating a reply" indefinitely, with no way back to a usable state.
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), SERVER_TIMEOUT_MS);
    let res;
    try {
      res = await fetch(SERVER_CHAT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: userQ }),
        signal: controller.signal,
      });
    } catch (err) {
      throw new Error(
        err.name === 'AbortError'
          ? "The fallback service didn't respond in time. Your browser needs WebGPU to run the assistant locally."
          : "Couldn't reach the fallback service. Your browser needs WebGPU to run the assistant locally."
      );
    } finally {
      clearTimeout(timeoutId);
    }
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || 'The fallback service returned an error.');
    setMessages(p => [
      ...p.filter(m => m.role !== 'loading'),
      { role: 'ai', text: data.response || '' },
    ]);
  };

  const send = async (q) => {
    const query = (q || input).trim();
    if (!query) return;
    if (!q) setInput('');
    setMessages(p => [...p, { role: 'user', text: query }, { role: 'loading', text: '' }]);

    if (gpuSupported.current) {
      try {
        await ensureWebLLM();
        await runLocalChat(query);
      } catch {
        setMode('server');
        // Strip the pre-pushed empty/partial ai bubble from the failed local
        // stream (the server path only filters 'loading'), and restore the
        // loading indicator while the server responds.
        setMessages(p => {
          const next = p.filter(m => m.role !== 'loading');
          if (next.length && next[next.length - 1].role === 'ai') next.pop();
          return [...next, { role: 'loading', text: '' }];
        });
        try { await runServerChat(query); }
        catch (e) {
          setMessages(p => [
            ...p.filter(m => m.role !== 'loading'),
            { role: 'error', text: e.message },
          ]);
        }
      }
    } else {
      try { await runServerChat(query); }
      catch (e) {
        setMessages(p => [
          ...p.filter(m => m.role !== 'loading'),
          { role: 'error', text: e.message },
        ]);
      }
    }
  };

  const cancel = () => {
    genRef.current++;
    interruptGenerate();
    setIsStreaming(false);
    setMessages(p => p.filter(m => m.role !== 'loading'));
  };

  const hasMessages = messages.length > 0;
  const busy = isStreaming || isInitializing;
  const status = engineStatus({ isInitializing, isStreaming, mode });

  // Section entrance. Reduced motion keeps the fade (which conveys arrival)
  // and drops the travel (which is the part that causes trouble).
  const rise = (delay = 0) => ({
    initial: reduceMotion ? { opacity: 0 } : { opacity: 0, y: 16 },
    whileInView: reduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 },
    viewport: { once: true, margin: '-80px' },
    transition: { duration: reduceMotion ? 0.3 : 0.6, ease: EASE, delay: reduceMotion ? 0 : delay },
  });

  const bubbleIn = {
    initial: reduceMotion ? { opacity: 0 } : { opacity: 0, y: 8 },
    animate: reduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 },
    transition: { duration: reduceMotion ? 0.16 : 0.28, ease: EASE },
  };

  const markdownComponents = {
    a: ({ node, children, ...p }) => (
      <a {...p} target="_blank" rel="noopener noreferrer">
        {children}
      </a>
    ),
    ul: ({ node, ...p }) => <ul {...p} />,
    ol: ({ node, ...p }) => <ol {...p} />,
    p: ({ node, ...p }) => <p {...p} />,
    pre: ({ node, ...p }) => <pre {...p} className="ask-pre" />,
    // react-markdown v9 removed the `inline` prop; detect
    // block code via a language- className or a newline.
    code: ({ node, className, children, ...p }) => {
      const isBlock =
        /language-/.test(className || '') || /\n/.test(String(children));
      return isBlock ? (
        <code {...p} className="ask-code-block">
          {children}
        </code>
      ) : (
        <code {...p} className="ask-code-inline">
          {children}
        </code>
      );
    },
  };

  return (
    <section id="ask" className="v2-section ask-root">
      <div className="ask-glow" aria-hidden="true" />

      <div className="v2-container">
        <div className="ask-shell">
          {/* ---------- Section header ---------- */}
          <motion.header {...rise()}>
            <div className="v2-eyebrow">
              <span className="v2-eyebrow__index">02</span>
              <span className="v2-eyebrow__line" aria-hidden="true" />
              <span>The Showstopper</span>
            </div>

            <h2 className="v2-h2">
              Ask me anything.{' '}
              <span className="v2-gradient-text">In your browser.</span>
            </h2>

            <p className="v2-lede">
              This assistant is a language model running on your own GPU through WebGPU. It
              downloads once, then answers with no API call and no server round trip, nothing
              you type here ever leaves the tab.
            </p>

            <ul className="ask-trust">
              {TRUST.map(({ label, live }) => (
                <li key={label} className={live ? 'v2-tag v2-tag--live ask-trust__item' : 'v2-tag ask-trust__item'}>
                  {live && <span className="ask-trust__dot" aria-hidden="true" />}
                  {label}
                </li>
              ))}
            </ul>
          </motion.header>

          {/* ---------- Chat panel ---------- */}
          <motion.div {...rise(0.08)} className="v2-card ask-panel">
            {/* Header strip */}
            <div className="ask-panel__head">
              <div className="ask-panel__id">
                <span className="ask-panel__dot" data-tone={status.tone} aria-hidden="true" />
                <span className="ask-panel__name">Deep&rsquo;s AI Assistant</span>
                <span className="ask-panel__sub">runs in this tab</span>
              </div>
              <span className="ask-state" data-tone={status.tone}>
                {status.label}
              </span>
            </div>

            {/* Transcript */}
            <div
              className={hasMessages ? 'ask-transcript' : 'ask-transcript ask-transcript--empty'}
              role="log"
              aria-live="polite"
              aria-relevant="additions"
              aria-label="Conversation with the in-browser assistant"
            >
              {!hasMessages && (
                <div className="ask-empty">
                  <span className="ask-empty__mark">
                    <ChipMark size={22} />
                  </span>
                  <div className="ask-empty__copy">
                    <p className="ask-empty__title">Nothing loaded yet, ask the first question.</p>
                    <p className="ask-empty__sub">
                      The model downloads on your first message, then runs entirely offline.
                    </p>
                  </div>
                  <SuggestionChips
                    disabled={busy}
                    onPick={send}
                    className="ask-empty__chips"
                  />
                </div>
              )}

              <AnimatePresence initial={false}>
                {messages.map((msg, i) => {
                  // An 'ai' bubble is pushed empty and filled token by token, so
                  // until the first token lands it shows the same pending beat as
                  // the explicit 'loading' placeholder.
                  const isLast = i === messages.length - 1;
                  const pending = msg.role === 'loading' || (msg.role === 'ai' && !msg.text);

                  return (
                    <motion.div
                      key={i}
                      {...bubbleIn}
                      className={`ask-msg ${msg.role === 'user' ? 'ask-msg--user' : 'ask-msg--ai'}`}
                    >
                      {msg.role === 'user' ? (
                        <div className="ask-bubble ask-bubble--user">{msg.text}</div>
                      ) : msg.role === 'error' ? (
                        <div className="ask-bubble ask-bubble--error">
                          <svg
                            width="15"
                            height="15"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            aria-hidden="true"
                            focusable="false"
                            className="ask-bubble__icon"
                          >
                            <circle cx="12" cy="12" r="9" />
                            <path d="M12 7.5v5M12 16.2h.01" />
                          </svg>
                          <span>{msg.text}, try again.</span>
                        </div>
                      ) : (
                        <>
                          <span className="ask-avatar" aria-hidden="true">
                            <ChipMark size={15} />
                          </span>
                          <div
                            className={
                              pending && (isStreaming || msg.role === 'loading')
                                ? 'ask-bubble ask-bubble--ai ask-typing'
                                : 'ask-bubble ask-bubble--ai'
                            }
                            data-streaming={isStreaming && isLast && !pending ? 'true' : undefined}
                          >
                            {pending ? (
                              isStreaming || msg.role === 'loading' ? (
                                <TypingDots />
                              ) : (
                                <span className="ask-bubble__muted">Stopped.</span>
                              )
                            ) : (
                              <div className="ask-md">
                                <ReactMarkdown components={markdownComponents}>
                                  {msg.text}
                                </ReactMarkdown>
                              </div>
                            )}
                          </div>
                        </>
                      )}
                    </motion.div>
                  );
                })}
              </AnimatePresence>

              <div ref={bottomRef} />
            </div>

            {/* Status rail, download progress, or the stop control while streaming */}
            {isInitializing ? (
              <div className="ask-rail">
                <div className="ask-progress__head">
                  <span className="ask-progress__label">Downloading the model</span>
                  <span className="ask-progress__pct">{progress}%</span>
                </div>
                <div
                  className="ask-progress__track"
                  role="progressbar"
                  aria-label="Model download progress"
                  aria-valuenow={progress}
                  aria-valuemin={0}
                  aria-valuemax={100}
                >
                  {/* Revealed with clip-path rather than width so the gradient stays
                      mapped to the full track and nothing triggers layout. */}
                  <span
                    className="ask-progress__fill"
                    style={{ clipPath: `inset(0 ${100 - progress}% 0 0)` }}
                  />
                </div>
                <p className="ask-progress__note">
                  This happens once, then it runs offline, straight off your GPU.
                </p>
              </div>
            ) : isStreaming ? (
              <div className="ask-rail ask-rail--center">
                <button type="button" onClick={cancel} className="ask-stop" aria-label="Stop generating">
                  <svg width="9" height="9" viewBox="0 0 10 10" aria-hidden="true" focusable="false">
                    <rect width="10" height="10" rx="2.5" fill="currentColor" />
                  </svg>
                  Stop generating
                </button>
              </div>
            ) : null}

            {/* Composer */}
            <div className="ask-composer">
              {hasMessages && (
                <SuggestionChips disabled={busy} onPick={send} className="ask-composer__chips" />
              )}

              <label htmlFor="ask-input" className="ask-sr-only">
                Ask a question about Deep&rsquo;s work
              </label>
              <div className="ask-field">
                <input
                  id="ask-input"
                  type="text"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter' && !e.shiftKey && !isStreaming && !isInitializing) {
                      e.preventDefault();
                      send();
                    }
                  }}
                  disabled={busy}
                  placeholder="Ask about Deep's work…"
                  autoComplete="off"
                  className="ask-field__input"
                />
                <button
                  type="button"
                  onClick={() => send()}
                  disabled={busy || !input.trim()}
                  aria-label="Send message"
                  className="v2-btn v2-btn--primary ask-send"
                >
                  <svg
                    width="15"
                    height="15"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                    focusable="false"
                  >
                    <path d="M12 19V5M5 12l7-7 7 7" />
                  </svg>
                </button>
              </div>
            </div>
          </motion.div>

          <p className="v2-meta ask-foot">
            No WebGPU in your browser? It falls back to a hosted model automatically, same
            answers, one network hop.
          </p>
        </div>
      </div>

      <style>{PANEL_CSS}</style>
    </section>
  );
}

/* ==========================================================================
   Panel styling. Everything here is derived from the v2 tokens in theme.css , 
   the only literals are alpha variants of --v2-accent (#6366f1) / --v2-live
   (#22d3ee), which is the same convention theme.css uses for .v2-tag--live.
   ========================================================================== */
const PANEL_CSS = `
.ask-root {
  position: relative;
  font-family: 'DM Sans', system-ui, sans-serif;
}

.ask-glow {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: radial-gradient(ellipse 58% 46% at 50% 58%, rgba(99, 102, 241, 0.10), transparent 70%);
}

.ask-shell {
  position: relative;
  max-width: 900px;
  margin-inline: auto;
}

.ask-sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
  border: 0;
}

/* background-clip:text crops descenders against a 1.06 line-height; vertical
   padding on an inline box extends the paint area without moving the baseline. */
.ask-root .v2-gradient-text {
  padding-block: 0.06em;
}

/* --- trust strip ---------------------------------------------------------- */

.ask-trust {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  list-style: none;
  padding: 0;
  margin: 1.75rem 0 0;
}

.ask-trust__item {
  gap: 0.4375rem;
}

.ask-trust__dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: currentColor;
  box-shadow: 0 0 6px currentColor;
  flex: none;
  animation: ask-pulse 2.4s ease-in-out infinite;
}

/* --- panel ---------------------------------------------------------------- */

.ask-panel {
  margin-top: clamp(2rem, 5vh, 3rem);
  overflow: hidden;
}

.ask-panel__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  padding: 0.8125rem clamp(0.875rem, 3vw, 1.375rem);
  border-bottom: 1px solid var(--v2-line-weak);
  background: rgba(0, 0, 0, 0.2);
}

.ask-panel__id {
  display: flex;
  align-items: center;
  gap: 0.625rem;
  min-width: 0;
}

.ask-panel__dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  flex: none;
  background: var(--v2-text-3);
  transition: background-color var(--v2-t) var(--v2-ease), box-shadow var(--v2-t) var(--v2-ease);
}

.ask-panel__dot[data-tone='live'] {
  background: var(--v2-live);
  box-shadow: 0 0 8px rgba(34, 211, 238, 0.65);
}

.ask-panel__dot[data-tone='accent'] {
  background: var(--v2-accent-bright);
  box-shadow: 0 0 8px var(--v2-accent-glow);
  animation: ask-pulse 1.5s ease-in-out infinite;
}

.ask-panel__name {
  font-size: 0.8125rem;
  font-weight: 500;
  color: var(--v2-text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.ask-panel__sub {
  font-size: 0.75rem;
  color: var(--v2-text-3);
  white-space: nowrap;
}

.ask-panel__sub::before {
  content: '·';
  margin-right: 0.5rem;
}

.ask-state {
  display: inline-flex;
  align-items: center;
  font-size: 0.6875rem;
  font-weight: 500;
  letter-spacing: 0.015em;
  line-height: 1;
  padding: 0.4375rem 0.6875rem;
  border-radius: 999px;
  border: 1px solid var(--v2-line-weak);
  background: var(--v2-surface-1);
  color: var(--v2-text-3);
  white-space: nowrap;
  flex: none;
  transition:
    color var(--v2-t) var(--v2-ease),
    border-color var(--v2-t) var(--v2-ease),
    background-color var(--v2-t) var(--v2-ease);
}

.ask-state[data-tone='live'] {
  color: var(--v2-live);
  border-color: rgba(34, 211, 238, 0.28);
  background: rgba(34, 211, 238, 0.07);
}

.ask-state[data-tone='accent'] {
  color: var(--v2-accent-bright);
  border-color: rgba(99, 102, 241, 0.3);
  background: rgba(99, 102, 241, 0.09);
}

/* --- transcript ----------------------------------------------------------- */

.ask-transcript {
  min-height: clamp(240px, 32vh, 320px);
  max-height: clamp(340px, 50vh, 480px);
  overflow-y: auto;
  overscroll-behavior: contain;
  padding: clamp(1rem, 3vw, 1.5rem);
  background: rgba(0, 0, 0, 0.12);
  scrollbar-width: thin;
  scrollbar-color: rgba(255, 255, 255, 0.16) transparent;
}

.ask-transcript--empty {
  display: flex;
  align-items: center;
  justify-content: center;
}

.ask-transcript::-webkit-scrollbar {
  width: 10px;
}

.ask-transcript::-webkit-scrollbar-track {
  background: transparent;
}

.ask-transcript::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.14);
  border: 3px solid transparent;
  background-clip: padding-box;
  border-radius: 999px;
}

.ask-transcript:hover::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.26);
  background-clip: padding-box;
}

/* --- empty state ---------------------------------------------------------- */

.ask-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 0.9375rem;
  width: 100%;
  padding: 0.5rem 0;
}

.ask-empty__mark {
  display: grid;
  place-items: center;
  width: 46px;
  height: 46px;
  border-radius: 15px;
  color: var(--v2-accent-bright);
  border: 1px solid rgba(99, 102, 241, 0.24);
  background: radial-gradient(120% 120% at 50% 0%, rgba(99, 102, 241, 0.2), rgba(99, 102, 241, 0.05));
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.4), 0 16px 36px -20px var(--v2-accent-glow);
}

.ask-empty__copy {
  max-width: 44ch;
}

.ask-empty__title {
  margin: 0;
  font-size: 0.9375rem;
  font-weight: 500;
  color: var(--v2-text);
}

.ask-empty__sub {
  margin: 0.375rem 0 0;
  font-size: 0.8125rem;
  line-height: 1.6;
  color: var(--v2-text-3);
}

.ask-empty__chips {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.5rem;
  margin-top: 0.125rem;
}

/* --- suggestion chips ----------------------------------------------------- */

.ask-suggest {
  font-family: inherit;
  font-size: 0.75rem;
  font-weight: 450;
  line-height: 1;
  padding: 0.5rem 0.8125rem;
  border-radius: 999px;
  border: 1px solid var(--v2-line);
  background: var(--v2-surface-1);
  color: var(--v2-text-2);
  white-space: nowrap;
  cursor: pointer;
  transition:
    color var(--v2-t-fast) var(--v2-ease),
    border-color var(--v2-t-fast) var(--v2-ease),
    background-color var(--v2-t-fast) var(--v2-ease),
    transform var(--v2-t-fast) var(--v2-ease);
}

.ask-suggest:hover:not(:disabled) {
  color: var(--v2-text);
  border-color: var(--v2-line-strong);
  background: var(--v2-surface-2);
  transform: translateY(-1px);
}

.ask-suggest:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

/* --- messages ------------------------------------------------------------- */

.ask-msg {
  display: flex;
  align-items: flex-start;
  gap: 0.625rem;
}

.ask-msg + .ask-msg {
  margin-top: 0.875rem;
}

.ask-msg--user {
  justify-content: flex-end;
}

.ask-avatar {
  display: grid;
  place-items: center;
  width: 28px;
  height: 28px;
  flex: none;
  margin-top: 3px;
  border-radius: 9px;
  color: #fff;
  background: linear-gradient(135deg, var(--v2-accent) 0%, var(--v2-accent-2) 100%);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.4), 0 8px 20px -10px var(--v2-accent-glow);
}

.ask-bubble {
  min-width: 0;
  max-width: min(72ch, 100%);
  padding: 0.875rem 1.125rem;
  border-radius: var(--v2-r-md);
  font-size: 0.9375rem;
  line-height: 1.68;
  overflow-wrap: anywhere;
}

.ask-bubble--ai {
  border-top-left-radius: 6px;
  border: 1px solid var(--v2-line-weak);
  background: var(--v2-surface-1);
  color: var(--v2-text-2);
}

.ask-bubble--user {
  max-width: min(52ch, 100%);
  border-top-right-radius: 6px;
  border: 1px solid rgba(99, 102, 241, 0.26);
  background: rgba(99, 102, 241, 0.13);
  color: var(--v2-text);
}

.ask-bubble--error {
  display: flex;
  align-items: flex-start;
  gap: 0.5625rem;
  border-top-left-radius: 6px;
  border: 1px solid rgba(239, 68, 68, 0.24);
  background: rgba(239, 68, 68, 0.08);
  color: #fca5a5;
  font-size: 0.875rem;
}

.ask-bubble__icon {
  flex: none;
  margin-top: 0.25rem;
}

/* Cancelled before the first token arrived, say so rather than leaving a
   bubble that reads as a rendering bug. */
.ask-bubble__muted {
  font-size: 0.875rem;
  font-style: italic;
  color: var(--v2-text-3);
}

/* --- typing indicator ----------------------------------------------------- */

.ask-typing {
  display: flex;
  align-items: center;
  gap: 0.3125rem;
  padding: 1.0625rem 1.125rem;
}

.ask-typing__dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: var(--v2-accent-bright);
  opacity: 0.3;
  animation: ask-blink 1.25s ease-in-out infinite;
}

.ask-typing__dot:nth-child(3) { animation-delay: 0.16s; }
.ask-typing__dot:nth-child(4) { animation-delay: 0.32s; }

/* Shimmering caret pinned to the end of the last block while tokens land. */
.ask-bubble[data-streaming='true'] .ask-md > :last-child::after {
  content: '';
  display: inline-block;
  width: 2px;
  height: 0.95em;
  margin-left: 3px;
  vertical-align: -0.12em;
  border-radius: 1px;
  background: var(--v2-accent-bright);
  animation: ask-caret 1.05s steps(1, end) infinite;
}

/* --- markdown ------------------------------------------------------------- */

.ask-md > :first-child { margin-top: 0; }
.ask-md > :last-child { margin-bottom: 0; }

.ask-md p {
  margin: 0 0 0.75rem;
}

.ask-md ul,
.ask-md ol {
  margin: 0 0 0.75rem;
  padding-inline-start: 1.15rem;
}

.ask-md li {
  margin: 0 0 0.3125rem;
}

.ask-md li::marker {
  color: var(--v2-text-4);
}

.ask-md h1,
.ask-md h2,
.ask-md h3,
.ask-md h4 {
  margin: 1rem 0 0.5rem;
  font-family: 'Space Grotesk', system-ui, sans-serif;
  font-size: 0.9375rem;
  font-weight: 600;
  letter-spacing: -0.012em;
  color: var(--v2-text);
}

.ask-md strong {
  font-weight: 600;
  color: var(--v2-text);
}

.ask-md a {
  color: var(--v2-accent-bright);
  text-decoration: underline;
  text-underline-offset: 2px;
  transition: color var(--v2-t-fast) var(--v2-ease);
}

.ask-md a:hover {
  color: var(--v2-text);
}

.ask-md blockquote {
  margin: 0 0 0.75rem;
  padding-inline-start: 0.875rem;
  border-inline-start: 2px solid var(--v2-line);
  color: var(--v2-text-3);
}

.ask-md code {
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: 0.8125em;
}

.ask-code-inline {
  padding: 0.12em 0.36em;
  border-radius: 5px;
  border: 1px solid var(--v2-line-weak);
  background: var(--v2-surface-3);
  color: var(--v2-text);
}

.ask-pre {
  margin: 0 0 0.75rem;
  max-width: 100%;
  overflow-x: auto;
  border-radius: var(--v2-r-sm);
  border: 1px solid var(--v2-line-weak);
  background: rgba(0, 0, 0, 0.42);
}

.ask-code-block {
  display: block;
  padding: 0.875rem 1rem;
  overflow-x: auto;
  white-space: pre;
  line-height: 1.6;
  color: var(--v2-text-2);
}

/* --- status rail ---------------------------------------------------------- */

.ask-rail {
  padding: 0.875rem clamp(0.875rem, 3vw, 1.375rem);
  border-top: 1px solid var(--v2-line-weak);
  background: rgba(0, 0, 0, 0.16);
}

.ask-rail--center {
  display: flex;
  justify-content: center;
}

.ask-progress__head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 0.75rem;
  margin-bottom: 0.5rem;
}

.ask-progress__label {
  font-size: 0.75rem;
  color: var(--v2-text-2);
}

.ask-progress__pct {
  font-size: 0.75rem;
  font-variant-numeric: tabular-nums;
  color: var(--v2-accent-bright);
}

.ask-progress__track {
  height: 4px;
  border-radius: 999px;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.07);
}

.ask-progress__fill {
  display: block;
  height: 100%;
  border-radius: 999px;
  background: linear-gradient(90deg, var(--v2-accent) 0%, var(--v2-accent-2) 55%, var(--v2-live) 100%);
  transition: clip-path var(--v2-t) var(--v2-ease);
}

.ask-progress__note {
  margin: 0.5625rem 0 0;
  font-size: 0.75rem;
  line-height: 1.5;
  color: var(--v2-text-3);
}

.ask-stop {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  font-family: inherit;
  font-size: 0.75rem;
  font-weight: 500;
  line-height: 1;
  padding: 0.5rem 0.9375rem;
  border-radius: 999px;
  border: 1px solid var(--v2-line);
  background: var(--v2-surface-1);
  color: var(--v2-text-2);
  cursor: pointer;
  transition:
    color var(--v2-t-fast) var(--v2-ease),
    border-color var(--v2-t-fast) var(--v2-ease),
    background-color var(--v2-t-fast) var(--v2-ease);
}

.ask-stop:hover {
  color: var(--v2-text);
  border-color: var(--v2-line-strong);
  background: var(--v2-surface-2);
}

/* --- composer ------------------------------------------------------------- */

.ask-composer {
  padding: clamp(0.875rem, 3vw, 1.125rem) clamp(0.875rem, 3vw, 1.375rem);
  border-top: 1px solid var(--v2-line-weak);
  background: rgba(0, 0, 0, 0.22);
}

.ask-composer__chips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4375rem;
  margin-bottom: 0.8125rem;
}

.ask-field {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.3125rem 0.3125rem 0.3125rem 1.0625rem;
  border-radius: 999px;
  border: 1px solid var(--v2-line);
  background: var(--v2-surface-1);
  transition:
    border-color var(--v2-t) var(--v2-ease),
    background-color var(--v2-t) var(--v2-ease),
    box-shadow var(--v2-t) var(--v2-ease);
}

.ask-field:focus-within {
  border-color: var(--v2-line-strong);
  background: var(--v2-surface-2);
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.14);
}

.ask-field__input {
  flex: 1 1 auto;
  min-width: 0;
  padding: 0.5rem 0;
  border: 0;
  background: transparent;
  outline: none;
  font-family: inherit;
  font-size: 0.875rem;
  color: var(--v2-text);
}

.ask-field__input::placeholder {
  color: var(--v2-text-3);
}

.ask-field__input:disabled {
  color: var(--v2-text-3);
  cursor: not-allowed;
}

/* The field wrapper carries the focus treatment, so the input must not draw a
   second ring inside it. */
.ask-root .ask-field__input:focus-visible {
  outline: none;
}

.ask-root .ask-send {
  width: 38px;
  height: 38px;
  min-width: 38px;
  flex: none;
  gap: 0;
  padding: 0;
  border-radius: 50%;
  justify-content: center;
}

.ask-root .ask-send:disabled {
  opacity: 0.35;
  cursor: not-allowed;
  box-shadow: none;
}

.ask-root .ask-send:disabled:hover {
  transform: none;
  box-shadow: none;
}

.ask-foot {
  margin: 1rem 0 0;
  max-width: 62ch;
  line-height: 1.6;
}

/* --- motion --------------------------------------------------------------- */

@keyframes ask-blink {
  0%, 100% { opacity: 0.25; transform: translateY(0); }
  40%      { opacity: 1;    transform: translateY(-2px); }
}

@keyframes ask-pulse {
  0%, 100% { opacity: 1; }
  50%      { opacity: 0.35; }
}

@keyframes ask-caret {
  0%, 100% { opacity: 1; }
  50%      { opacity: 0; }
}

/* --- narrow viewports ----------------------------------------------------- */

@media (max-width: 560px) {
  .ask-panel__sub { display: none; }
  .ask-avatar { display: none; }
  .ask-bubble { font-size: 0.9rem; padding: 0.8125rem 1rem; }
}
`;
