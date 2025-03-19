import React, { useState, useEffect, useRef } from 'react';
import './Ask.css';

const Ask = () => {
    const [inputValue, setInputValue] = useState('');
    const [messages, setMessages] = useState([]);
    const [isChatActive, setIsChatActive] = useState(false);
    const [typedText, setTypedText] = useState('');
    const fullText = 'Curious about my skills or experience? Ask, and I’ll explain!';

    // 🔥 Create a reference for the message area
    const messageEndRef = useRef(null);

    useEffect(() => {
        const chatContainer = document.querySelector('.message-area');
        if (chatContainer) {
            chatContainer.scrollTop = chatContainer.scrollHeight;
        }
    }, [messages]);

    // Typing animation logic
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
    }, []);

    const handleInputChange = (event) => setInputValue(event.target.value);

    const simulateTypingEffect = (fullText, callback) => {
        let index = 0;
        let currentText = "";
        
        const typingInterval = setInterval(() => {
            if (index < fullText.length) {
                currentText += fullText[index];
                index++;
                callback(currentText);
            } else {
                clearInterval(typingInterval); // Stop typing effect when done
            }
        }, 1); // Adjust speed (milliseconds per character)
    };
    
    const handleChatSubmit = async () => {
        if (!inputValue.trim()) {
            setMessages((prev) => [...prev, { type: 'error', text: 'Please type your message before submitting.' }]);
            return;
        }
    
        setIsChatActive(true);
        const currentInput = inputValue;
        setInputValue('');
    
        // ✅ Keep user's query message in chat history
        setMessages((prev) => [
            ...prev,
            { type: 'query', text: currentInput }, 
            { type: 'loading', text: 'Looking for Answer...' } // Loading message
        ]);
    
        const backendUrl = 'https://fastapi-app-latest-bsb8.onrender.com/chat';
    
        try {
            const response = await fetch(backendUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt: currentInput })
            });
    
            const data = await response.json();
    
            if (!response.ok) throw new Error(data.error || 'An error occurred while fetching data.');
    
            const generatedText = data.response || 'No response received.';
    
            // ✅ Remove "Looking for Answer..." before adding the response
            setMessages((prev) => prev.slice(0, -1));
    
            // ✅ Simulate typing effect to display answer gradually
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
            // ✅ Ensure loading message is removed even on error
            setMessages((prev) => prev.slice(0, -1));
    
            setMessages((prev) => [...prev, { type: 'error', text: `${error.message}. Try Again.` }]);
        }
    };
    
    const handleKeyDown = (event) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            handleChatSubmit();
        }
    };

    return (
        <div className={`ask-container ${isChatActive ? 'active-chat' : ''}`}>
            {!isChatActive && <h1 className="ask-header">{typedText}</h1>}
            {isChatActive && (
                <div className="message-area">
                    {messages.map((msg, index) => (
                        <div 
                            key={index} 
                            className={`message ${msg.type}`} 
                            dangerouslySetInnerHTML={{ __html: msg.text }}
                            ></div>                    
                        ))}
                    {/* 🔥 Add a reference at the bottom of the chat */}
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
                    />
                </div>
                <div className="button-group">
                    <div className="button-left">
                        <button className="cv-button">CV</button>
                        <button className="mail-button">Mail</button>
                    </div>
                    <button className="submit-button" onClick={handleChatSubmit}>↑</button>
                </div>
            </div>
        </div>
    );
};

export default Ask;
