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
        const chatContainer = document.querySelector('.message-area');
        if (chatContainer) {
            chatContainer.scrollTop = chatContainer.scrollHeight;
        }
    }, [messages]);

    // Typing animation logic for header
    useEffect(() => {
        let index = 0;
        const typeText = () => {
            if (index <= fullText.length) {
                setTypedText(fullText.slice(0, index));
                index++;
                setTimeout(typeText, 50);
            }
        };
        typeText();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // fullText is a constant, no need to include in deps

    const handleInputChange = (event) => setInputValue(event.target.value);

    // Simulate typing effect for backend fallback (kept for compatibility)
    const simulateTypingEffect = (fullText, callback) => {
        let index = 0;
        let currentText = "";
        
        const typingInterval = setInterval(() => {
            if (index < fullText.length) {
                currentText += fullText[index];
                index++;
                callback(currentText);
            } else {
                clearInterval(typingInterval);
            }
        }, 1);
    };

    // Initialize WebLLM on first use
    const ensureWebLLMInitialized = async () => {
        if (!webLLMAvailableRef.current) {
            throw new Error('WebGPU not supported');
        }

        try {
            setIsInitializing(true);
            setModelProgress(0);
            
            // Add timeout to prevent getting stuck
            const timeoutPromise = new Promise((_, reject) => {
                setTimeout(() => reject(new Error('Model loading timeout')), 120000); // 2 minutes
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
            } catch (err) {
                clearInterval(progressInterval);
                throw err;
            }
            
            setIsInitializing(false);
            setMode('local');
            webLLMAvailableRef.current = true;
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
        const backendUrl = 'https://portfolio-backend-wt45.onrender.com/chat';

        try {
            const response = await fetch(backendUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt: userPrompt })
            });

            const data = await response.json();

            if (!response.ok) throw new Error(data.error || 'An error occurred while fetching data.');

            const generatedText = data.response || 'No response received.';

            // Remove loading message
            setMessages((prev) => prev.filter(msg => msg.type !== 'loading'));

            // Simulate typing effect for backend (optional, for UX consistency)
            let responseMessage = { type: 'response', text: '' };
            setMessages((prev) => [...prev, responseMessage]);

            simulateTypingEffect(generatedText, (updatedText) => {
                setMessages((prev) => {
                    let updatedMessages = [...prev];
                    updatedMessages[updatedMessages.length - 1] = { type: 'response', text: updatedText };
                    return updatedMessages;
                });
            });
        } catch (error) {
            throw error;
        }
    };

    const handleChatSubmit = async () => {
        if (!inputValue.trim()) {
            setMessages((prev) => [...prev, { type: 'error', text: 'Please type your message before submitting.' }]);
            return;
        }

        setIsChatActive(true);
        const currentInput = inputValue;
        setInputValue('');

        // Add user query
        setMessages((prev) => [
            ...prev,
            { type: 'query', text: currentInput }
        ]);

        // Determine loading message
        let loadingText = 'Looking for Answer...';
        if (webLLMAvailableRef.current && isInitializing) {
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
                console.log('WebLLM init failed, falling back to server:', error);
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
                console.error('Local chat failed, falling back to server:', error);
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
                    // Style code blocks
                    code: ({ node, inline, ...props }) => (
                        <code {...props} className={inline ? 'markdown-inline-code' : 'markdown-code-block'} />
                    ),
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
                <div className="message-area">
                    {/* Mode indicator */}
                    {mode !== 'unknown' && (
                        <div className="mode-badge">
                            {mode === 'local' ? '🖥️ Local Mode' : '🌐 Server Fallback'}
                        </div>
                    )}
                    {/* Model loading progress - only show if progress > 0 to avoid stuck at 0% */}
                    {isInitializing && modelProgress > 0 && (
                        <div className="model-progress">
                            <div className="progress-text">Loading local model... {modelProgress}%</div>
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
                        placeholder="Ask Junior"
                        className="ask-input"
                        value={inputValue}
                        onChange={handleInputChange}
                        onKeyDown={handleKeyDown}
                        disabled={isStreaming || isInitializing}
                    />
                </div>
                <div className="button-group">
                    <div className="button-left">
                        <a
                            href="https://drive.google.com/file/d/1HEcSVsRSDa37442Z091bWi7TaV9SMcjM/view?usp=sharing"
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
                        <button className="cancel-button" onClick={handleCancel}>
                            ✕
                        </button>
                    ) : (
                        <button 
                            className="submit-button" 
                            onClick={handleChatSubmit}
                            disabled={isInitializing}
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
