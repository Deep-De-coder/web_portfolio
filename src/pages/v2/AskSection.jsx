import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import {
  init as initWebLLM,
  streamChat,
  interruptGenerate,
  isWebGPUSupported,
} from '../../utils/webllmClient';

const QUICK = [
  { label: 'Education', q: 'Tell me about your education background' },
  { label: 'Experience', q: 'Tell me about your work experience' },
  { label: 'Projects', q: 'What are your most impressive projects?' },
  { label: 'Skills', q: 'What are your main technical skills?' },
  { label: 'Publications', q: 'Tell me about your research publications' },
];

const TECH_BADGES = ['WebGPU', 'On-device inference', 'MLC-AI WebLLM', 'Zero data transfer'];

export default function AskSection() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [mode, setMode] = useState('unknown');

  const gpuSupported = useRef(typeof window !== 'undefined' ? isWebGPUSupported() : false);
  const webLLMReady = useRef(false);
  const abortRef = useRef(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    if (!gpuSupported.current) setMode('server');
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const ensureWebLLM = async () => {
    if (webLLMReady.current) return;
    setIsInitializing(true);
    setProgress(0);
    try {
      await initWebLLM((p) => setProgress(p));
      webLLMReady.current = true;
      setIsInitializing(false);
      setMode('local');
    } catch (err) {
      setIsInitializing(false);
      gpuSupported.current = false;
      setMode('server');
      throw err;
    }
  };

  const runLocalChat = async (userQ) => {
    abortRef.current = false;
    setIsStreaming(true);
    const history = [];
    for (const m of messages) {
      if (m.role === 'user') history.push({ role: 'user', content: m.text });
      else if (m.role === 'ai') history.push({ role: 'assistant', content: m.text });
    }
    setMessages(p => [...p.filter(m => m.role !== 'loading'), { role: 'ai', text: '' }]);
    let acc = '';
    await streamChat({
      systemPrompt: `You are an AI assistant embedded in Deep Shahane's portfolio. Deep is an AI researcher with expertise in computer vision, LLMs, and robotics. Answer questions about his education (VIT Bachelor's + UB Master's), experience (SAIR Lab, Bragr, Captain Cool, VIT), projects, and skills concisely and professionally.`,
      history,
      userPrompt: userQ,
      onToken: (tok) => {
        if (abortRef.current) return;
        acc += tok;
        setMessages(p => {
          const next = [...p];
          const last = next[next.length - 1];
          if (last?.role === 'ai') next[next.length - 1] = { role: 'ai', text: acc };
          return next;
        });
      },
    });
    setIsStreaming(false);
  };

  const runServerChat = async (userQ) => {
    const res = await fetch('https://portfolio-backend-wt45.onrender.com/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: userQ }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Server error');
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
    abortRef.current = true;
    interruptGenerate();
    setIsStreaming(false);
    setMessages(p => p.filter(m => m.role !== 'loading'));
  };

  const hasMessages = messages.length > 0;

  return (
    <section id="ask" className="py-24 px-6 relative" style={{ background: 'transparent' }}>
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 60% 40% at 50% 100%, rgba(99,102,241,0.07) 0%, transparent 70%)',
        }}
      />

      <div className="relative z-10 max-w-4xl mx-auto">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
          className="mb-14"
        >
          <div className="flex items-center gap-3 mb-5">
            <span className="font-dm text-[11px] tracking-[0.16em] text-slate-600 uppercase">01</span>
            <div className="w-6 h-px bg-slate-700" />
            <span className="font-dm text-[11px] tracking-[0.16em] text-slate-600 uppercase">The Showstopper</span>
          </div>
          <h2
            className="font-grotesk font-bold text-white mb-5 leading-tight"
            style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', letterSpacing: '-0.022em' }}
          >
            Ask me anything.{' '}
            <span style={{ color: '#818cf8' }}>In your browser.</span>
          </h2>
          <p className="font-dm text-slate-400 max-w-xl leading-relaxed" style={{ fontSize: '1.05rem' }}>
            This AI assistant runs entirely via WebGPU — a next-gen GPU API built into your browser.
            No API calls. No data leaves your device. The model downloads once, then runs locally on your GPU.
          </p>
          <div className="flex flex-wrap gap-2 mt-5">
            {TECH_BADGES.map(b => (
              <span
                key={b}
                className="font-dm text-xs px-3 py-1.5 rounded-full"
                style={{ border: '1px solid rgba(99,102,241,0.28)', background: 'rgba(99,102,241,0.08)', color: '#a5b4fc' }}
              >
                {b}
              </span>
            ))}
          </div>
        </motion.div>

        {/* Chat card */}
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="rounded-2xl overflow-hidden"
          style={{ border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.02)' }}
        >
          {/* Chat top bar */}
          <div
            className="flex items-center justify-between px-5 py-3.5"
            style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(0,0,0,0.22)' }}
          >
            <div className="flex items-center gap-2.5">
              <span
                className="w-2 h-2 rounded-full bg-emerald-400"
                style={{ boxShadow: '0 0 7px rgba(52,211,153,0.85)' }}
              />
              <span className="font-dm text-xs text-slate-400">Deep's AI Assistant</span>
            </div>
            {mode !== 'unknown' && (
              <span
                className="font-dm text-[10px] px-2.5 py-1 rounded-full"
                style={{
                  background: mode === 'local' ? 'rgba(99,102,241,0.14)' : 'rgba(34,211,238,0.1)',
                  border: `1px solid ${mode === 'local' ? 'rgba(99,102,241,0.32)' : 'rgba(34,211,238,0.24)'}`,
                  color: mode === 'local' ? '#a5b4fc' : '#67e8f9',
                }}
              >
                {mode === 'local' ? '⚡ WebGPU Local' : '🌐 Server Fallback'}
              </span>
            )}
          </div>

          {/* Messages */}
          <div
            className="px-5 py-4 overflow-y-auto"
            style={{ minHeight: hasMessages ? '300px' : '100px', maxHeight: '400px' }}
          >
            {!hasMessages && (
              <p className="font-dm text-sm text-slate-600 text-center pt-5">
                Ask about my education, experience, projects, or skills...
              </p>
            )}
            <AnimatePresence initial={false}>
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25 }}
                  className={`mb-3 flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {msg.role === 'loading' ? (
                    <div
                      className="flex items-center gap-1.5 px-4 py-3 rounded-2xl rounded-tl-sm"
                      style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)' }}
                    >
                      {[0, 1, 2].map(j => (
                        <span
                          key={j}
                          className="w-1.5 h-1.5 rounded-full bg-indigo-400"
                          style={{ animation: `ask-bounce 1.2s ease-in-out ${j * 0.18}s infinite` }}
                        />
                      ))}
                    </div>
                  ) : msg.role === 'user' ? (
                    <div
                      className="max-w-xs lg:max-w-md px-4 py-3 rounded-2xl rounded-tr-sm font-dm text-sm text-white"
                      style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
                    >
                      {msg.text}
                    </div>
                  ) : msg.role === 'error' ? (
                    <div
                      className="px-4 py-3 rounded-2xl rounded-tl-sm font-dm text-sm text-red-400"
                      style={{ background: 'rgba(239,68,68,0.09)', border: '1px solid rgba(239,68,68,0.2)' }}
                    >
                      {msg.text} — Try again.
                    </div>
                  ) : (
                    <div
                      className="max-w-prose px-4 py-3 rounded-2xl rounded-tl-sm font-dm text-sm text-slate-200"
                      style={{
                        background: 'rgba(255,255,255,0.04)',
                        border: '1px solid rgba(255,255,255,0.08)',
                        lineHeight: 1.65,
                      }}
                    >
                      <ReactMarkdown
                        components={{
                          a: ({ children, ...p }) => (
                            <a {...p} target="_blank" rel="noopener noreferrer" className="text-indigo-400 underline">
                              {children}
                            </a>
                          ),
                          ul: ({ ...p }) => <ul {...p} className="list-disc list-inside mt-1 space-y-0.5" />,
                          ol: ({ ...p }) => <ol {...p} className="list-decimal list-inside mt-1 space-y-0.5" />,
                          code: ({ inline, children, ...p }) =>
                            inline ? (
                              <code {...p} className="rounded px-1 py-0.5 text-xs" style={{ background: 'rgba(255,255,255,0.1)' }}>
                                {children}
                              </code>
                            ) : (
                              <code
                                {...p}
                                className="block rounded text-xs mt-2 p-3 overflow-x-auto"
                                style={{ background: 'rgba(0,0,0,0.4)' }}
                              >
                                {children}
                              </code>
                            ),
                          p: ({ ...p }) => <p {...p} className="mb-2 last:mb-0" />,
                        }}
                      >
                        {msg.text}
                      </ReactMarkdown>
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Model download progress */}
            {isInitializing && progress > 0 && (
              <div
                className="my-3 px-4 py-3 rounded-xl"
                style={{ background: 'rgba(99,102,241,0.07)', border: '1px solid rgba(99,102,241,0.18)' }}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-dm text-xs text-indigo-300">Downloading model to your device...</span>
                  <span className="font-dm text-xs text-indigo-400 tabular-nums">{progress}%</span>
                </div>
                <div className="h-1 rounded-full overflow-hidden" style={{ background: 'rgba(99,102,241,0.18)' }}>
                  <div
                    className="h-full rounded-full transition-all duration-300"
                    style={{ width: `${progress}%`, background: 'linear-gradient(90deg, #6366f1, #22d3ee)' }}
                  />
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input zone */}
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', background: 'rgba(0,0,0,0.15)' }}>
            {/* Quick chips */}
            <div className="flex flex-wrap gap-1.5 px-4 pt-3 pb-2">
              {QUICK.map(({ label, q }) => (
                <button
                  key={label}
                  onClick={() => !isStreaming && !isInitializing && send(q)}
                  disabled={isStreaming || isInitializing}
                  className="px-3 py-1.5 rounded-full font-dm text-xs cursor-pointer transition-colors duration-150 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{ border: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8', background: 'rgba(255,255,255,0.03)' }}
                >
                  {label}
                </button>
              ))}
            </div>
            {/* Text input row */}
            <div className="flex items-center gap-2 px-4 pb-4">
              <input
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' && !e.shiftKey && !isStreaming && !isInitializing) {
                    e.preventDefault();
                    send();
                  }
                }}
                disabled={isStreaming || isInitializing}
                placeholder="Ask about Deep's work..."
                className="flex-1 rounded-xl px-4 py-3 font-dm text-sm outline-none transition-all duration-150 disabled:opacity-50 placeholder-slate-600"
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.09)',
                  color: '#f1f5f9',
                }}
              />
              {isStreaming ? (
                <button
                  onClick={cancel}
                  aria-label="Stop generation"
                  className="w-10 h-10 rounded-xl font-dm text-sm flex items-center justify-center cursor-pointer transition-colors duration-150 text-slate-400 hover:text-white flex-shrink-0"
                  style={{ border: '1px solid rgba(239,68,68,0.3)', background: 'rgba(239,68,68,0.08)' }}
                >
                  ✕
                </button>
              ) : (
                <button
                  onClick={() => send()}
                  disabled={isInitializing || !input.trim()}
                  aria-label="Send message"
                  className="w-10 h-10 rounded-xl flex items-center justify-center cursor-pointer transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-80 flex-shrink-0"
                  style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 19V5M5 12l7-7 7 7"/>
                  </svg>
                </button>
              )}
            </div>
          </div>
        </motion.div>

        {/* Contact links */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="flex flex-wrap items-center gap-4 mt-6"
        >
          <a href="mailto:esotericdeep@gmail.com" className="font-dm text-sm text-slate-600 hover:text-slate-300 transition-colors duration-150 cursor-pointer">
            esotericdeep@gmail.com
          </a>
          <span className="w-px h-3 bg-slate-800" />
          <a href="https://github.com/Deep-De-coder" target="_blank" rel="noopener noreferrer" className="font-dm text-sm text-slate-600 hover:text-slate-300 transition-colors duration-150 cursor-pointer">
            GitHub
          </a>
          <span className="w-px h-3 bg-slate-800" />
          <a href="https://www.linkedin.com/in/deepshahane/" target="_blank" rel="noopener noreferrer" className="font-dm text-sm text-slate-600 hover:text-slate-300 transition-colors duration-150 cursor-pointer">
            LinkedIn
          </a>
        </motion.div>
      </div>

      <style>{`
        @keyframes ask-bounce {
          0%,80%,100% { transform: translateY(0); }
          40% { transform: translateY(-6px); }
        }
      `}</style>
    </section>
  );
}
