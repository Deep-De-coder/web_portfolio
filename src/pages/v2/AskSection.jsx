import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import {
  init as initWebLLM,
  streamChat,
  interruptGenerate,
  isWebGPUSupported,
} from '../../utils/webllmClient';
import { buildSystemPrompt, asThirdPerson, highlightFacts } from '../../data/assistantKnowledge';

const EASE = [0.16, 1, 0.3, 1];

// Phrased in the third person on purpose. A visitor reading a portfolio asks
// about Deep, and the model behind this chat answers a "your publications"
// question as though it were being asked about itself.
const QUICK = [
  { label: 'Education', q: "What is Deep's education background?" },
  { label: 'Experience', q: "Tell me about Deep's work experience." },
  { label: 'Projects', q: "What are Deep's most impressive projects?" },
  { label: 'Skills', q: "What are Deep's main technical skills?" },
  { label: 'Publications', q: 'What has Deep published?' },
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
  const transcriptRef = useRef(null);

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

  // Keep the transcript following its newest message, and keep the page out
  // of it.
  //
  // This used to call scrollIntoView() on a sentinel at the end of the
  // transcript, which scrolls every scrollable ancestor, the document
  // included: picking a suggestion chip dragged the visitor 200-odd pixels
  // down the page. Setting scrollTop can only ever move this one element.
  //
  // It also used to fire on messages.length, which is too early. A bubble is
  // measured before its entrance animation settles and before its markdown
  // renders, and a streamed answer then grows for another several seconds, so
  // the transcript pinned itself to a height the content had already passed.
  // Watching the subtree catches a new bubble and every token after it.
  useEffect(() => {
    const el = transcriptRef.current;
    if (!el) return undefined;

    // Following stops the moment the reader scrolls up to re-read something,
    // and resumes when they come back to the bottom.
    let follow = true;
    const onScroll = () => {
      follow = el.scrollHeight - el.scrollTop - el.clientHeight < 48;
    };
    const pin = () => {
      if (follow) el.scrollTop = el.scrollHeight;
    };

    const observer = new MutationObserver(pin);
    observer.observe(el, { childList: true, subtree: true, characterData: true });
    el.addEventListener('scroll', onScroll, { passive: true });

    return () => {
      observer.disconnect();
      el.removeEventListener('scroll', onScroll);
    };
  }, []);

  // A watchdog on silence, not a deadline on the whole download.
  //
  // The model is over a gigabyte and the previous code gave the entire
  // download two minutes. It cannot finish in two minutes, so
  // a perfectly healthy download was cancelled around a third of the way in
  // and the visitor was dropped to the hosted fallback, which is the one thing
  // this section exists to avoid. WebLLM reports progress continuously, so
  // what actually signals a dead init is the reporting stopping. The timer is
  // re-armed on every progress event and only fires if nothing arrives for a
  // full minute.
  const INIT_STALL_MS = 60000;
  // Generous on purpose: the fallback runs on a free Render instance that
  // spins down when idle, and a cold start alone can take ~45s. Short enough
  // that a genuinely unreachable backend still releases the UI.
  const SERVER_TIMEOUT_MS = 75000;
  const SERVER_CHAT_URL =
    import.meta.env.VITE_BACKEND_URL || 'https://portfolio-backend-wt45.onrender.com/chat';

  const ensureWebLLM = async () => {
    if (webLLMReady.current) return;
    setIsInitializing(true);
    setProgress(0);
    let stallId;
    try {
      await new Promise((resolve, reject) => {
        const arm = () => {
          clearTimeout(stallId);
          stallId = setTimeout(
            () => reject(new Error('WebLLM initialization stalled')),
            INIT_STALL_MS
          );
        };
        arm();
        initWebLLM((p) => {
          setProgress(p);
          arm();
        }).then(resolve, reject);
      });
      webLLMReady.current = true;
      setMode('local');
    } catch (err) {
      gpuSupported.current = false;
      setMode('server');
      throw err;
    } finally {
      clearTimeout(stallId);
      setIsInitializing(false);
    }
  };

  const runLocalChat = async (userQ) => {
    const gen = ++genRef.current;
    setIsStreaming(true);
    setMessages(p => [...p.filter(m => m.role !== 'loading'), { role: 'ai', text: '' }]);
    let acc = '';
    const asked = asThirdPerson(userQ);
    try {
      // streamChat returns the answer with any dangling fragment removed, so
      // the final bubble is its return value rather than the raw token run.
      const settled = await streamChat({
        // Only the blocks this question is about, which is the difference
        // between the model quoting the brief and the model rewriting it.
        systemPrompt: buildSystemPrompt(asked),
        // No history. Each question is answered against the blocks it needs,
        // so an earlier turn's answer was drawn from a brief this one does
        // not have: asked for Deep's skills straight after his publications,
        // the model answered with the publications. Independent questions
        // cost the odd follow-up and buy correct answers.
        history: [],
        userPrompt: asked,
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
      if (genRef.current === gen && settled !== acc) {
        setMessages(p => {
          const next = [...p];
          const last = next[next.length - 1];
          if (last?.role === 'ai') next[next.length - 1] = { role: 'ai', text: settled };
          return next;
        });
      }
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
        body: JSON.stringify({ prompt: asThirdPerson(userQ) }),
        signal: controller.signal,
      });
    } catch (err) {
      throw new Error(
        err.name === 'AbortError'
          ? "The fallback service didn't respond in time. Your browser needs WebGPU to run Erevna locally."
          : "Couldn't reach the fallback service. Your browser needs WebGPU to run Erevna locally."
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

  // Output arrives the way a shell prints it: it appears, it does not slide
  // in from somewhere. A short fade is enough to mark that a line is new.
  const lineIn = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    transition: { duration: reduceMotion ? 0.12 : 0.22, ease: EASE },
  };

  // Figures arrive as code spans and names as bold, both added by
  // highlightFacts rather than by the model. Inside the terminal neither
  // gets a chip or a background, only its own colour, the way a shell
  // distinguishes output.
  const markdownComponents = {
    a: ({ node, children, ...p }) => (
      <a {...p} target="_blank" rel="noopener noreferrer">
        {children}
      </a>
    ),
    pre: ({ node, ...p }) => <pre {...p} className="term__pre" />,
    // react-markdown v9 removed the `inline` prop; detect
    // block code via a language- className or a newline.
    code: ({ node, className, children, ...p }) => {
      const isBlock = /language-/.test(className || '') || /\n/.test(String(children));
      return isBlock ? (
        <code {...p} className="term__code-block">
          {children}
        </code>
      ) : (
        <code {...p} className="term__figure">
          {children}
        </code>
      );
    },
  };

  // A drawn progress bar rather than a styled div: on a terminal, the blocks
  // are the honest way to show it, and they line up with the mono grid.
  const BAR_CELLS = 28;
  const filledCells = Math.max(0, Math.min(BAR_CELLS, Math.round((progress / 100) * BAR_CELLS)));

  return (
    <section id="ask" className="v2-section ask-root">
      <div className="v2-container">
        <div className="ask-shell">
          {/* ---------- Section header, on paper ---------- */}
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
              Erevna is a language model running on your own GPU through WebGPU. It
              downloads once, then answers with no API call and no server round trip, nothing
              you type here ever leaves the tab.
            </p>

            <ul className="ask-trust">
              {TRUST.map(({ label, live }) => (
                <li
                  key={label}
                  className={live ? 'v2-tag v2-tag--live ask-trust__item' : 'v2-tag ask-trust__item'}
                >
                  {live && <span className="ask-trust__dot" aria-hidden="true" />}
                  {label}
                </li>
              ))}
            </ul>
          </motion.header>

          {/* ---------- The terminal ---------- */}
          <motion.div {...rise(0.08)} className="term" data-reduced={reduceMotion || undefined}>
            <div className="term__chrome">
              <span className="term__lights" aria-hidden="true">
                <i />
                <i />
                <i />
              </span>
              <span className="term__path">
                deep@portfolio
                <span className="term__punct">:</span>~/ask
              </span>
              <span className="term__status" data-tone={status.tone}>
                <span className="term__status-dot" aria-hidden="true" />
                {status.label}
              </span>
            </div>

            <div
              ref={transcriptRef}
              className="term__screen"
              role="log"
              aria-live="polite"
              aria-relevant="additions"
              aria-label="Conversation with Erevna, the in-browser assistant"
            >
              {!hasMessages && (
                <div className="term__boot">
                  <p>
                    <span className="term__name">erevna</span>{' '}
                    <span className="term__figure">1.0</span>{' '}
                    <span className="term__faint">·</span>{' '}
                    <span className="term__dim">language model, on your GPU, via WebGPU</span>
                  </p>
                  <p className="term__dim">
                    The model downloads once on your first question, then answers offline.
                  </p>
                  <p className="term__dim">
                    Nothing you type here is sent anywhere.
                  </p>
                  <p className="term__boot-hint">
                    <span className="term__faint">Ask below, or run:</span>{' '}
                    {QUICK.map(({ label }, i) => (
                      <React.Fragment key={label}>
                        {i > 0 && <span className="term__faint"> · </span>}
                        <span className="term__cmdname">{label.toLowerCase()}</span>
                      </React.Fragment>
                    ))}
                  </p>
                </div>
              )}

              <AnimatePresence initial={false}>
                {messages.map((msg, i) => {
                  // An 'ai' line is pushed empty and filled token by token, so
                  // until the first token lands it shows the same pending beat
                  // as the explicit 'loading' placeholder.
                  const isLast = i === messages.length - 1;
                  const pending = msg.role === 'loading' || (msg.role === 'ai' && !msg.text);

                  if (msg.role === 'user') {
                    return (
                      <motion.p key={i} {...lineIn} className="term__cmd">
                        <span className="term__sigil" aria-hidden="true">
                          ❯
                        </span>
                        <span>{msg.text}</span>
                      </motion.p>
                    );
                  }

                  if (msg.role === 'error') {
                    return (
                      <motion.p key={i} {...lineIn} className="term__error">
                        <span className="term__error-tag">error</span>
                        <span>{msg.text}, try again.</span>
                      </motion.p>
                    );
                  }

                  return (
                    <motion.div key={i} {...lineIn} className="term__out">
                      {pending ? (
                        isStreaming || msg.role === 'loading' ? (
                          <p className="term__working">
                            <span className="term__spinner" aria-hidden="true" />
                            <span className="term__dim">thinking</span>
                            <span className="ask-sr-only">Generating a reply</span>
                          </p>
                        ) : (
                          <p className="term__faint">^C stopped.</p>
                        )
                      ) : (
                        <div
                          className="term__md"
                          data-streaming={isStreaming && isLast ? 'true' : undefined}
                        >
                          <ReactMarkdown components={markdownComponents}>
                            {highlightFacts(msg.text)}
                          </ReactMarkdown>
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>

            {/* Download progress, or the stop control while streaming */}
            {isInitializing ? (
              <div className="term__rail">
                <div
                  className="term__progress"
                  role="progressbar"
                  aria-label="Model download progress"
                  aria-valuenow={progress}
                  aria-valuemin={0}
                  aria-valuemax={100}
                >
                  <span className="term__dim">pulling model</span>
                  <span className="term__bar" aria-hidden="true">
                    <span className="term__bar-fill">{'█'.repeat(filledCells)}</span>
                    <span className="term__bar-rest">{'░'.repeat(BAR_CELLS - filledCells)}</span>
                  </span>
                  <span className="term__figure">{String(progress).padStart(3, ' ')}%</span>
                </div>
                <p className="term__faint term__progress-note">
                  Once only. After this it runs offline, straight off your GPU.
                </p>
              </div>
            ) : isStreaming ? (
              <div className="term__rail term__rail--center">
                <button type="button" onClick={cancel} className="term__stop">
                  <span className="term__key">^C</span> stop generating
                </button>
              </div>
            ) : null}

            {/* Composer */}
            <div className="term__composer">
              <div className="term__commands">
                <span className="term__faint term__commands-label">run</span>
                {QUICK.map(({ label, q }) => (
                  <button
                    key={label}
                    type="button"
                    onClick={() => !busy && send(q)}
                    disabled={busy}
                    className="term__command"
                  >
                    {label.toLowerCase()}
                  </button>
                ))}
              </div>

              <label htmlFor="ask-input" className="ask-sr-only">
                Ask a question about Deep&rsquo;s work
              </label>
              <div className="term__prompt">
                <span className="term__sigil" aria-hidden="true">
                  ❯
                </span>
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
                  placeholder="ask about Deep's work"
                  autoComplete="off"
                  spellCheck="false"
                  className="term__input"
                />
                <button
                  type="button"
                  onClick={() => send()}
                  disabled={busy || !input.trim()}
                  aria-label="Send message"
                  className="term__send"
                >
                  <span aria-hidden="true">return ⏎</span>
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

      <style>{TERMINAL_CSS}</style>
    </section>
  );
}

/* ==========================================================================
   The terminal.

   One dark object on a paper page, in the same warm near-black as the body
   ink so it reads as part of the document rather than a widget dropped onto
   it. Everything inside is set in the page's mono face on a fixed grid, and
   colour carries meaning rather than decoration: rose for what the visitor
   typed and for the places the work happened, amber for every measured
   figure, teal for the one fact that matters live, that this is running on
   their own hardware.
   ========================================================================== */
const TERMINAL_CSS = `
.ask-root {
  position: relative;
}

.ask-shell {
  position: relative;
  max-width: 880px;
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

/* --- trust strip, on paper ------------------------------------------------ */

.ask-trust {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  list-style: none;
  padding: 0;
  margin: 1.75rem 0 0;
}

.ask-trust__item { gap: 0.4375rem; }

.ask-trust__dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: currentColor;
  flex: none;
  animation: term-pulse 2.4s ease-in-out infinite;
}

.ask-foot {
  margin: 1.125rem 0 0;
  max-width: 62ch;
  line-height: 1.6;
}

/* --- the window ----------------------------------------------------------- */

.term {
  --t-bg: #17110f;
  --t-bg-2: #1e1715;
  --t-bg-3: #241c1a;
  --t-fg: #ece2dd;
  --t-dim: #a89793;
  --t-faint: #7a6a66;
  --t-line: rgba(236, 226, 221, 0.09);
  --t-rose: #e9a2ae;
  --t-amber: #e8b776;
  --t-teal: #74d0bd;

  margin-top: clamp(2rem, 5vh, 3rem);
  border-radius: var(--v2-r-xl);
  overflow: hidden;
  background: var(--t-bg);
  border: 1px solid #0f0b0a;
  box-shadow:
    0 1px 2px rgba(26, 20, 22, 0.16),
    0 28px 56px -28px rgba(26, 20, 22, 0.45);
  font-family: var(--v2-mono);
  font-size: 0.8125rem;
  line-height: 1.75;
  color: var(--t-fg);
  font-variant-ligatures: none;
}

/* --- chrome --------------------------------------------------------------- */

.term__chrome {
  display: flex;
  align-items: center;
  gap: 0.875rem;
  padding: 0.6875rem 0.9375rem;
  background: var(--t-bg-2);
  border-bottom: 1px solid var(--t-line);
}

.term__lights {
  display: inline-flex;
  gap: 0.4375rem;
  flex: none;
}

.term__lights i {
  width: 9px;
  height: 9px;
  border-radius: 50%;
  background: var(--t-rose);
  opacity: 0.85;
}

.term__lights i:nth-child(2) { background: var(--t-amber); }
.term__lights i:nth-child(3) { background: var(--t-teal); }

.term__path {
  flex: 1 1 auto;
  min-width: 0;
  font-size: 0.75rem;
  color: var(--t-dim);
  text-align: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.term__punct { color: var(--t-faint); }

.term__status {
  display: inline-flex;
  align-items: center;
  gap: 0.4375rem;
  flex: none;
  font-size: 0.6875rem;
  letter-spacing: 0.02em;
  color: var(--t-dim);
  white-space: nowrap;
}

.term__status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--t-faint);
  flex: none;
}

.term__status[data-tone='live'] { color: var(--t-teal); }
.term__status[data-tone='live'] .term__status-dot {
  background: var(--t-teal);
  box-shadow: 0 0 7px rgba(116, 208, 189, 0.7);
}

.term__status[data-tone='accent'] { color: var(--t-amber); }
.term__status[data-tone='accent'] .term__status-dot {
  background: var(--t-amber);
  animation: term-pulse 1.4s ease-in-out infinite;
}

/* --- screen --------------------------------------------------------------- */

.term__screen {
  min-height: clamp(200px, 28vh, 280px);
  max-height: clamp(330px, 50vh, 480px);
  overflow-y: auto;
  overscroll-behavior: contain;
  padding: clamp(0.875rem, 2.5vw, 1.25rem);
  scrollbar-width: thin;
  scrollbar-color: rgba(236, 226, 221, 0.16) transparent;
}

.term__screen::-webkit-scrollbar { width: 10px; }
.term__screen::-webkit-scrollbar-track { background: transparent; }
.term__screen::-webkit-scrollbar-thumb {
  background: rgba(236, 226, 221, 0.14);
  border: 3px solid transparent;
  background-clip: padding-box;
  border-radius: 999px;
}
.term__screen:hover::-webkit-scrollbar-thumb {
  background: rgba(236, 226, 221, 0.24);
  background-clip: padding-box;
}

/* --- boot banner ---------------------------------------------------------- */

.term__boot p { margin: 0 0 0.25rem; }
.term__boot-hint { margin: 0.875rem 0 0; }

.term__name { color: var(--t-fg); }
.term__dim { color: var(--t-dim); }
.term__faint { color: var(--t-faint); }

.term__cmdname {
  color: var(--t-rose);
}

/* --- lines ---------------------------------------------------------------- */

.term__cmd {
  display: flex;
  gap: 0.625rem;
  margin: 1.125rem 0 0.375rem;
  color: var(--t-fg);
  overflow-wrap: anywhere;
}

.term__cmd:first-child { margin-top: 0; }

.term__sigil {
  flex: none;
  color: var(--t-rose);
  user-select: none;
}

.term__out {
  margin: 0 0 0.25rem;
  padding-left: 1.3125rem;
  color: var(--t-dim);
  overflow-wrap: anywhere;
}

.term__error {
  display: flex;
  gap: 0.5625rem;
  margin: 0.375rem 0 0;
  padding-left: 1.3125rem;
  color: #f0a9a0;
}

.term__error-tag {
  flex: none;
  color: #f0a9a0;
  opacity: 0.72;
}

/* --- working indicator ---------------------------------------------------- */

.term__working {
  display: flex;
  align-items: baseline;
  gap: 0.5rem;
  margin: 0;
}

.term__spinner {
  display: inline-block;
  width: 1ch;
  color: var(--t-amber);
}

.term__spinner::after {
  content: '|';
  animation: term-spin 0.72s steps(1, end) infinite;
}

/* --- markdown output ------------------------------------------------------ */

.term__md > :first-child { margin-top: 0; }
.term__md > :last-child { margin-bottom: 0; }

.term__md p { margin: 0 0 0.625rem; }

.term__md ul,
.term__md ol {
  margin: 0 0 0.625rem;
  padding-inline-start: 0;
  list-style: none;
}

.term__md li {
  margin: 0 0 0.1875rem;
  padding-left: 1.25rem;
  position: relative;
}

/* A shell lists with a marker, not a typographic bullet. */
.term__md li::before {
  content: '–';
  position: absolute;
  left: 0;
  color: var(--t-faint);
}

/* Names of places and projects. */
.term__md strong {
  font-weight: 400;
  color: var(--t-rose);
}

/* Anything measured. No chip, no border: in a terminal the colour is the
   emphasis, and a background here would break the mono grid. */
.term__figure {
  font-family: inherit;
  font-size: inherit;
  color: var(--t-amber);
  white-space: nowrap;
}

.term__md a {
  color: var(--t-teal);
  text-decoration: underline;
  text-underline-offset: 2px;
}

.term__md h1,
.term__md h2,
.term__md h3,
.term__md h4 {
  margin: 0.75rem 0 0.375rem;
  font-size: inherit;
  font-weight: 400;
  color: var(--t-fg);
}

.term__pre {
  margin: 0 0 0.625rem;
  max-width: 100%;
  overflow-x: auto;
  border-left: 2px solid var(--t-line);
  padding-left: 0.75rem;
}

.term__code-block {
  display: block;
  white-space: pre;
  color: var(--t-fg);
}

/* Block caret riding the end of the answer while tokens land. */
.term__md[data-streaming='true'] > :last-child::after {
  content: '▊';
  margin-left: 2px;
  color: var(--t-amber);
  animation: term-blink 1.05s steps(1, end) infinite;
}

/* --- rail ----------------------------------------------------------------- */

.term__rail {
  padding: 0.75rem clamp(0.875rem, 2.5vw, 1.25rem);
  border-top: 1px solid var(--t-line);
  background: var(--t-bg-2);
}

.term__rail--center {
  display: flex;
  justify-content: center;
}

.term__progress {
  display: flex;
  align-items: baseline;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.term__bar {
  letter-spacing: -0.5px;
  white-space: nowrap;
}

.term__bar-fill { color: var(--t-amber); }
.term__bar-rest { color: var(--t-faint); opacity: 0.5; }

.term__progress-note {
  margin: 0.375rem 0 0;
  font-size: 0.75rem;
}

.term__stop {
  font: inherit;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.3125rem 0.75rem;
  border-radius: var(--v2-r-sm);
  border: 1px solid var(--t-line);
  background: transparent;
  color: var(--t-dim);
  cursor: pointer;
  transition: color var(--v2-t-fast) var(--v2-ease), border-color var(--v2-t-fast) var(--v2-ease);
}

.term__stop:hover {
  color: var(--t-fg);
  border-color: rgba(236, 226, 221, 0.22);
}

.term__key {
  color: var(--t-amber);
}

/* --- composer ------------------------------------------------------------- */

.term__composer {
  padding: 0.75rem clamp(0.875rem, 2.5vw, 1.25rem) 0.9375rem;
  border-top: 1px solid var(--t-line);
  background: var(--t-bg-2);
}

.term__commands {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.4375rem;
  margin-bottom: 0.75rem;
}

.term__commands-label {
  margin-right: 0.125rem;
  font-size: 0.75rem;
  color: var(--t-dim);
}

.term__command {
  font: inherit;
  font-size: 0.75rem;
  line-height: 1;
  padding: 0.3125rem 0.5625rem;
  border-radius: var(--v2-r-sm);
  border: 1px solid var(--t-line);
  background: var(--t-bg-3);
  color: var(--t-dim);
  cursor: pointer;
  transition:
    color var(--v2-t-fast) var(--v2-ease),
    border-color var(--v2-t-fast) var(--v2-ease),
    background-color var(--v2-t-fast) var(--v2-ease);
}

.term__command:hover:not(:disabled) {
  color: var(--t-rose);
  border-color: rgba(233, 162, 174, 0.34);
  background: rgba(233, 162, 174, 0.08);
}

.term__command:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.term__prompt {
  display: flex;
  align-items: center;
  gap: 0.625rem;
  padding: 0.5rem 0.6875rem;
  border-radius: var(--v2-r-sm);
  border: 1px solid var(--t-line);
  background: var(--t-bg);
  transition: border-color var(--v2-t) var(--v2-ease), box-shadow var(--v2-t) var(--v2-ease);
}

.term__prompt:focus-within {
  border-color: rgba(233, 162, 174, 0.38);
  box-shadow: 0 0 0 3px rgba(233, 162, 174, 0.1);
}

.term__input {
  flex: 1 1 auto;
  min-width: 0;
  border: 0;
  padding: 0;
  background: transparent;
  outline: none;
  font: inherit;
  color: var(--t-fg);
  caret-color: var(--t-amber);
}

.term__input::placeholder { color: var(--t-faint); }
.term__input:disabled { color: var(--t-faint); cursor: not-allowed; }
.term .term__input:focus-visible { outline: none; }

.term__send {
  font: inherit;
  font-size: 0.6875rem;
  flex: none;
  padding: 0.25rem 0.5rem;
  border-radius: var(--v2-r-sm);
  border: 1px solid transparent;
  background: transparent;
  color: var(--t-faint);
  cursor: pointer;
  transition: color var(--v2-t-fast) var(--v2-ease), border-color var(--v2-t-fast) var(--v2-ease);
}

.term__send:not(:disabled):hover {
  color: var(--t-amber);
  border-color: rgba(232, 183, 118, 0.3);
}

.term__send:disabled { opacity: 0.45; cursor: not-allowed; }

/* --- motion --------------------------------------------------------------- */

@keyframes term-blink {
  0%, 100% { opacity: 1; }
  50%      { opacity: 0; }
}

@keyframes term-pulse {
  0%, 100% { opacity: 1; }
  50%      { opacity: 0.35; }
}

@keyframes term-spin {
  0%   { content: '|'; }
  25%  { content: '/'; }
  50%  { content: '—'; }
  75%  { content: '\\\\'; }
}

.term[data-reduced] .term__spinner::after,
.term[data-reduced] .term__md[data-streaming='true'] > :last-child::after,
.term[data-reduced] .term__status-dot,
.term[data-reduced] .ask-trust__dot {
  animation: none;
}

/* --- narrow viewports ----------------------------------------------------- */

@media (max-width: 560px) {
  .term { font-size: 0.78125rem; }
  .term__path { display: none; }
  .term__bar { display: none; }
  .term__out,
  .term__error { padding-left: 0; }
}
`;
