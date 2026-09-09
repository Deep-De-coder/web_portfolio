import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import './Ask.css';
import {
  init as initWebLLM,
  streamChat,
  interruptGenerate,
  isWebGPUSupported,
} from '../utils/webllmClient';

const Ask = () => {
    const [inputValue, setInputValue] = useState('');
    const [messages, setMessages] = useState([]);
    const [isChatActive, setIsChatActive] = useState(false);
    const [typedText, setTypedText] = useState('');
    const [mode, setMode] = useState('unknown'); // 'local', 'server', 'unknown'
    const [modelProgress, setModelProgress] = useState(0);
    const [isStreaming, setIsStreaming] = useState(false);
    const [isInitializing, setIsInitializing] = useState(false);
    const fullText = `Curious about my skills or experience? Ask, and I'll explain!`;

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
            
            // Add timeout to prevent getting stuck (2 minutes)
            let raceTimeoutId = null;
            const timeoutPromise = new Promise((_, reject) => {
                raceTimeoutId = setTimeout(() => reject(new Error('Model loading timeout after 2 minutes')), 120000); // 2 minutes
            });

            // Update progress periodically as fallback
            const progressInterval = setInterval(() => {
                setModelProgress((prev) => {
                    // Increment slowly if stuck
                    if (prev < 5) return prev + 1;
                    return prev;
                });
            }, 2000);
            
            try {
                await Promise.race([
                    initWebLLM((progress) => {
                        setModelProgress(progress);
                    }),
                    timeoutPromise
                ]);
                clearInterval(progressInterval);
                clearTimeout(raceTimeoutId);
            } catch (err) {
                clearInterval(progressInterval);
                clearTimeout(raceTimeoutId);
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
            // Build chat history from messages
            const history = [];
            for (let i = 0; i < messages.length; i++) {
                if (messages[i].type === 'query') {
                    history.push({ role: 'user', content: messages[i].text });
                } else if (messages[i].type === 'response') {
                    history.push({ role: 'assistant', content: messages[i].text });
                }
            }

            // System prompt about the portfolio
            const systemPrompt = `You are a helpful AI assistant for Deep Shahane's portfolio. 
Answer questions about Deep's experience, projects, skills, and education based on the portfolio information.
Be concise, professional, and accurate.`;

            // Remove loading message and add empty response
            setMessages((prev) => {
                const filtered = prev.filter(msg => msg.type !== 'loading');
                return [...filtered, { type: 'response', text: '' }];
            });

            let accumulatedText = '';

            await streamChat({
                systemPrompt,
                history,
                userPrompt,
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
        const backendUrl = process.env.REACT_APP_BACKEND_URL || 'https://portfolio-backend-wt45.onrender.com/chat';

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
                body: JSON.stringify({ prompt: userPrompt }),
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
            'education': 'Tell me about your education',
            'experience': 'Tell me about your work experience',
            'leadership': 'Tell me about your leadership qualities',
            'projects': 'Tell me about your projects',
            'skills': 'Tell me about your skills',
            'publications': 'Tell me about your publications'
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
                            href="https://drive.google.com/file/d/1huA6oTDVo2jL9u24RWxN6DAm_YVkURG2/view?usp=sharing"
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
