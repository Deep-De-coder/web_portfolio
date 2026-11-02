import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import './Ask.css';
import {
  init as initWebLLM,
  streamChat,
  interruptGenerate,
  isWebGPUSupported,
} from '../utils/webllmClient';
import { buildSystemPrompt, asThirdPerson } from '../data/assistantKnowledge';

const Ask = () => {
    const [inputValue, setInputValue] = useState('');
    const [messages, setMessages] = useState([]);
    const [isChatActive, setIsChatActive] = useState(false);
    const [typedText, setTypedText] = useState('');
    const [mode, setMode] = useState('unknown'); // 'local', 'server', 'unknown'
    const [modelProgress, setModelProgress] = useState(0);
    const [isStreaming, setIsStreaming] = useState(false);
    const [isInitializing, setIsInitializing] = useState(false);
    const fullText = `AI Engineer. Ask about my work, projects or research.`;

    const messageEndRef = useRef(null);
    const streamingAbortRef = useRef(false);
    const webLLMAvailableRef = useRef(false);
    const webLLMInitializedRef = useRef(false);
    const typingEffectRef = useRef(null);

    // Check WebGPU support on mount
    useEffect(() => {
        if (typeof window !== 'undefined') {
            webLLMAvailableRef.current = isWebGPUSupported();
            if (!webLLMAvailableRef.current) {
                setMode('server');
            }
        }
    }, []);

    useEffect(() => {
        const chatContainer = messageEndRef.current?.parentElement;
        if (chatContainer) {
            chatContainer.scrollTop = chatContainer.scrollHeight;
        }
    }, [messages]);

    // Typing animation logic for header
    useEffect(() => {
        let index = 0;
        let cancelled = false;
        let timeoutId = null;
        const typeText = () => {
            if (cancelled) return;
            if (index <= fullText.length) {
                setTypedText(fullText.slice(0, index));
                index++;
                timeoutId = setTimeout(typeText, 50);
            }
        };
        typeText();
        return () => {
            cancelled = true;
            if (timeoutId !== null) clearTimeout(timeoutId);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // fullText is a constant, no need to include in deps

    // Clear any pending simulated-typing frame on unmount
    useEffect(() => {
        return () => {
            if (typingEffectRef.current !== null) {
                cancelAnimationFrame(typingEffectRef.current);
                typingEffectRef.current = null;
            }
        };
    }, []);

    const handleInputChange = (event) => setInputValue(event.target.value);

    // Simulate typing effect for backend fallback (kept for compatibility)
    const simulateTypingEffect = (textToType, callback) => {
        let index = 0;
        const chunkSize = 4;

        const step = () => {
            if (index < textToType.length) {
                index = Math.min(index + chunkSize, textToType.length);
                callback(textToType.slice(0, index));
                typingEffectRef.current = requestAnimationFrame(step);
            } else {
                typingEffectRef.current = null;
            }
        };

        typingEffectRef.current = requestAnimationFrame(step);
    };

    // Initialize WebLLM on first use
    const ensureWebLLMInitialized = async () => {
        if (!webLLMAvailableRef.current) {
            throw new Error('WebGPU not supported');
        }

        try {
            setIsInitializing(true);
            setModelProgress(0);
            
            // A watchdog on silence, not a deadline on the whole download.
            // The model is over a gigabyte, and capping the entire download
            // at two minutes cancelled healthy downloads about a third of
            // the way in. WebLLM reports progress continuously, so the real
            // signal of a dead init is the reporting stopping: the timer is
            // re-armed on every progress event and fires only after a full
            // minute of silence.
            let stallId = null;

            // Update progress periodically as fallback
            const progressInterval = setInterval(() => {
                setModelProgress((prev) => {
                    // Increment slowly if stuck
                    if (prev < 5) return prev + 1;
                    return prev;
                });
            }, 2000);

            try {
                await new Promise((resolve, reject) => {
                    const arm = () => {
                        clearTimeout(stallId);
                        stallId = setTimeout(() => reject(new Error('Model loading stalled')), 60000);
                    };
                    arm();
                    initWebLLM((progress) => {
                        setModelProgress(progress);
                        arm();
                    }).then(resolve, reject);
                });
                clearInterval(progressInterval);
                clearTimeout(stallId);
            } catch (err) {
                clearInterval(progressInterval);
                clearTimeout(stallId);
                throw err;
            }

            setIsInitializing(false);
            setMode('local');
            webLLMAvailableRef.current = true;
            webLLMInitializedRef.current = true;
            return true;
        } catch (error) {
            console.error('WebLLM init failed:', error);
            setIsInitializing(false);
            setMode('server');
            webLLMAvailableRef.current = false;
            throw error;
        }
    };

    // Handle local WebLLM streaming
    const handleLocalChat = async (userPrompt) => {
        streamingAbortRef.current = false;
        setIsStreaming(true);

        try {
            const asked = asThirdPerson(userPrompt);
            // Only the blocks this question is about, which is the difference
            // between the model quoting the brief and the model rewriting it.
            const systemPrompt = buildSystemPrompt(asked);

            // Remove loading message and add empty response
            setMessages((prev) => {
                const filtered = prev.filter(msg => msg.type !== 'loading');
                return [...filtered, { type: 'response', text: '' }];
            });

            let accumulatedText = '';

            // streamChat returns the answer with any dangling fragment
            // removed, so the final bubble is its return value rather than
            // the raw token run.
            const settled = await streamChat({
                systemPrompt,
                // No history. Each question is answered against the blocks it
                // needs, so an earlier turn's answer came from a brief this
                // one does not have: asked for Deep's skills straight after
                // his publications, the model answered with the publications.
                history: [],
                userPrompt: asked,
                onToken: (token) => {
                    if (streamingAbortRef.current) return;
                    accumulatedText += token;
                    setMessages((prev) => {
                        const updated = [...prev];
                        const lastIdx = updated.length - 1;
                        if (updated[lastIdx]?.type === 'response') {
                            updated[lastIdx] = { type: 'response', text: accumulatedText };
                        }
                        return updated;
                    });
                },
            });

            if (!streamingAbortRef.current && settled !== accumulatedText) {
                setMessages((prev) => {
                    const updated = [...prev];
                    const lastIdx = updated.length - 1;
                    if (updated[lastIdx]?.type === 'response') {
                        updated[lastIdx] = { type: 'response', text: settled };
                    }
                    return updated;
                });
            }

            setIsStreaming(false);
        } catch (error) {
            setIsStreaming(false);
            if (!streamingAbortRef.current) {
                throw error;
            }
        }
    };

    // Handle backend fallback
    const handleBackendChat = async (userPrompt) => {
        const backendUrl = import.meta.env.VITE_BACKEND_URL || 'https://portfolio-backend-wt45.onrender.com/chat';

        const controller = new AbortController();
        // 75s: the backend is a free Render instance that spins down when
        // idle, and a cold start alone can take ~45s. A 30s deadline aborted
        // requests that would have succeeded.
        const fetchTimeoutId = setTimeout(() => controller.abort(), 75000);

        let data;
        let response;
        try {
            response = await fetch(backendUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt: asThirdPerson(userPrompt) }),
                signal: controller.signal
            });

            data = await response.json();
        } finally {
            clearTimeout(fetchTimeoutId);
        }

        if (!response.ok) throw new Error(data.error || 'An error occurred while fetching data.');

        const generatedText = data.response || 'No response received.';

        // Remove loading message
        setMessages((prev) => prev.filter(msg => msg.type !== 'loading'));

        // Simulate typing effect for backend (optional, for UX consistency)
        setMessages((prev) => [...prev, { type: 'response', text: '' }]);

        simulateTypingEffect(generatedText, (updatedText) => {
            setMessages((prev) => {
                let updatedMessages = [...prev];
                updatedMessages[updatedMessages.length - 1] = { type: 'response', text: updatedText };
                return updatedMessages;
            });
        });
    };

    const handleChatSubmit = async (customQuery = null) => {
        const queryToUse = customQuery || inputValue;
        
        if (!queryToUse.trim()) {
            setMessages((prev) => [...prev, { type: 'error', text: 'Please type your message before submitting.' }]);
            return;
        }

        setIsChatActive(true);
        const currentInput = queryToUse;
        if (!customQuery) {
            setInputValue('');
        }

        // Add user query
        setMessages((prev) => [
            ...prev,
            { type: 'query', text: currentInput }
        ]);

        // Determine loading message: local model still needs to load on first use
        let loadingText = 'Looking for Answer...';
        if (webLLMAvailableRef.current && !webLLMInitializedRef.current) {
            loadingText = 'Loading local model...';
        }

        setMessages((prev) => [
            ...prev,
            { type: 'loading', text: loadingText }
        ]);

        // Try local WebLLM first
        let useLocal = false;
        if (webLLMAvailableRef.current) {
            try {
                // Ensure WebLLM is initialized
                await ensureWebLLMInitialized();
                useLocal = true;
            } catch (error) {
                useLocal = false;
            }
        }

        if (useLocal) {
            try {
                // Update loading message
                setMessages((prev) => {
                    const updated = [...prev];
                    const lastIdx = updated.length - 1;
                    if (updated[lastIdx]?.type === 'loading') {
                        updated[lastIdx] = { type: 'loading', text: 'Generating response...' };
                    }
                    return updated;
                });

                await handleLocalChat(currentInput);
            } catch (error) {
                // Remove loading and try backend
                setMessages((prev) => prev.filter(msg => msg.type !== 'loading'));
                setMessages((prev) => [
                    ...prev,
                    { type: 'loading', text: 'Looking for Answer...' }
                ]);
                setMode('server');
                try {
                    await handleBackendChat(currentInput);
                } catch (backendError) {
                    setMessages((prev) => {
                        const filtered = prev.filter(msg => msg.type !== 'loading');
                        return [...filtered, { type: 'error', text: `${backendError.message}. Try Again.` }];
                    });
                }
            }
        } else {
            // Use backend directly
            setMode('server');
            try {
                await handleBackendChat(currentInput);
            } catch (error) {
                setMessages((prev) => {
                    const filtered = prev.filter(msg => msg.type !== 'loading');
                    return [...filtered, { type: 'error', text: `${error.message}. Try Again.` }];
                });
            }
        }
    };

    const handleCancel = () => {
        if (typingEffectRef.current !== null) {
            cancelAnimationFrame(typingEffectRef.current);
            typingEffectRef.current = null;
        }
        if (isStreaming) {
            streamingAbortRef.current = true;
            interruptGenerate();
            setIsStreaming(false);
            setMessages((prev) => {
                const filtered = prev.filter(msg => msg.type !== 'loading');
                return filtered;
            });
        }
    };

    const handleKeyDown = (event) => {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            if (!isStreaming) {
                handleChatSubmit();
            }
        }
    };

    // Handle quick action button clicks
    const handleQuickAction = (action) => {
        const queries = {
            'education': "Tell me about Deep's education",
            'experience': "Tell me about Deep's work experience",
            'leadership': "Tell me about Deep's leadership qualities",
            'projects': "Tell me about Deep's projects",
            'skills': "Tell me about Deep's skills",
            'publications': "Tell me about Deep's publications"
        };
        
        const query = queries[action];
        if (query && !isStreaming && !isInitializing) {
            // Directly submit with the query
            handleChatSubmit(query);
        }
    };

    // Render Markdown with proper formatting
    const renderMarkdown = (text) => {
        if (!text) return '';
        
        // Use react-markdown to parse and render Markdown
        // It handles **bold**, _italic_, links, lists, etc. automatically
        return (
            <ReactMarkdown
                components={{
                    // Style links
                    a: ({ node, children, ...props }) => (
                        <a {...props} target="_blank" rel="noopener noreferrer" className="markdown-link">
                            {children}
                        </a>
                    ),
                    // Style lists
                    ul: ({ node, ...props }) => <ul {...props} className="markdown-list" />,
                    ol: ({ node, ...props }) => <ol {...props} className="markdown-list" />,
                    // Style code blocks (react-markdown v9 removed the `inline` prop,
                    // so detect blocks via language-* className or embedded newlines)
                    code: ({ node, className, children, ...props }) => {
                        const isBlock = /language-/.test(className || '') || /\n/.test(String(children));
                        return (
                            <code {...props} className={isBlock ? 'markdown-code-block' : 'markdown-inline-code'}>
                                {children}
                            </code>
                        );
                    },
                    // Style paragraphs
                    p: ({ node, ...props }) => <p {...props} className="markdown-paragraph" />,
                }}
            >
                {text}
            </ReactMarkdown>
        );
    };

    return (
        <div className={`ask-container ${isChatActive ? 'active-chat' : ''}`}>
            {!isChatActive && <h1 className="ask-header">{typedText}</h1>}
            {isChatActive && (
                <div className="message-area" role="log" aria-live="polite">
                    {/* Mode indicator */}
                    {mode !== 'unknown' && (
                        <div className="mode-badge">
                            {mode === 'local' ? '🖥️ Local Mode' : '🌐 Server Fallback'}
                        </div>
                    )}
                    {/* Model loading progress - only show if progress > 0 to avoid stuck at 0% */}
                    {isInitializing && modelProgress > 0 && (
                        <div className="model-progress">
                            <div className="progress-text">
                                Loading local model... {modelProgress}% (Timeout: 2 minutes)
                            </div>
                            <div className="progress-bar">
                                <div className="progress-fill" style={{ width: `${modelProgress}%` }}></div>
                            </div>
                        </div>
                    )}
                    {messages.map((msg, index) => {
                        if (msg.type === 'query') {
                            // User messages - plain text (no HTML)
                            return (
                                <div key={index} className={`message ${msg.type}`}>
                                    {msg.text}
                                </div>
                            );
                        } else if (msg.type === 'response') {
                            // Assistant messages - render Markdown properly
                            return (
                                <div
                                    key={index}
                                    className={`message ${msg.type}`}
                                >
                                    {renderMarkdown(msg.text)}
                                </div>
                            );
                        } else {
                            // Loading/error messages - plain text
                            return (
                                <div key={index} className={`message ${msg.type}`}>
                                    {msg.text}
                                </div>
                            );
                        }
                    })}
                    <div ref={messageEndRef}></div>
                </div>
            )}
            <div className="input-group">
                <div className="chat-bar">
                    <input
                        type="text"
                        placeholder="Tell me about ..."
                        aria-label="Ask a question about Deep's portfolio"
                        className="ask-input"
                        value={inputValue}
                        onChange={handleInputChange}
                        onKeyDown={handleKeyDown}
                        disabled={isStreaming || isInitializing}
                    />
                </div>
                {/* Quick Action Buttons */}
                <div className="quick-actions">
                    <button 
                        className="quick-action-btn"
                        onClick={() => handleQuickAction('education')}
                        disabled={isStreaming || isInitializing}
                    >
                        Education
                    </button>
                    <button 
                        className="quick-action-btn"
                        onClick={() => handleQuickAction('experience')}
                        disabled={isStreaming || isInitializing}
                    >
                        Experience
                    </button>
                    <button 
                        className="quick-action-btn"
                        onClick={() => handleQuickAction('leadership')}
                        disabled={isStreaming || isInitializing}
                    >
                        Leadership
                    </button>
                    <button 
                        className="quick-action-btn"
                        onClick={() => handleQuickAction('projects')}
                        disabled={isStreaming || isInitializing}
                    >
                        Projects
                    </button>
                    <button 
                        className="quick-action-btn"
                        onClick={() => handleQuickAction('skills')}
                        disabled={isStreaming || isInitializing}
                    >
                        Skills
                    </button>
                    <button 
                        className="quick-action-btn"
                        onClick={() => handleQuickAction('publications')}
                        disabled={isStreaming || isInitializing}
                    >
                        Publications
                    </button>
                </div>
                <div className="button-group">
                    <div className="button-left">
                        <a
                            href="https://drive.google.com/file/d/1q9-9VMk70cHw87K7mhuZKY6eKp7_j10X/view?usp=sharing"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="cv-button"
                        >
                            CV
                        </a>
                        <a
                            href="mailto:esotericdeep@gmail.com"
                            className="mail-button"
                        >
                            Mail
                        </a>
                    </div>
                    {isStreaming ? (
                        <button className="cancel-button" onClick={handleCancel} aria-label="Cancel response">
                            ✕
                        </button>
                    ) : (
                        <button
                            className="submit-button"
                            onClick={() => handleChatSubmit()}
                            disabled={isInitializing}
                            aria-label="Send message"
                        >
                            ↑
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Ask;
