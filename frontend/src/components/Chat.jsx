import React, { useContext, useState, useEffect, useRef } from "react";
import { MyContext } from "../MyContext";
import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/atom-one-dark.css";

function Chat() {
    const {newChat, prevChats, reply} = useContext(MyContext);
    const [latestReply, setLatestReply] = useState(null);
    const [isTyping, setIsTyping] = useState(false);
    const chatEndRef = useRef(null);
    const chatContainerRef = useRef(null);

    // Auto scroll to bottom
    const scrollToBottom = () => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [prevChats, latestReply]);

    useEffect(() => {
        if(reply === null) {
            setLatestReply(null);
            setIsTyping(false);
            return;
        }

        if(!prevChats?.length) return;

        const content = reply.split(" ");
        setIsTyping(true);

        let idx = 0;
        const interval = setInterval(() => {
            setLatestReply(content.slice(0, idx+1).join(" "));

            idx++;
            if(idx >= content.length) {
                clearInterval(interval);
                setIsTyping(false);
            }
        }, 40);

        return () => clearInterval(interval);

    }, [prevChats, reply]);

    const formatTime = (timestamp) => {
        return new Date(timestamp || Date.now()).toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
    };

    const UserMessage = ({ content, timestamp }) => (
        <div className="flex justify-end mb-4" style={{ animation: 'slideInRight 0.3s ease-out' }}>
            <div className="flex items-end space-x-2 max-w-[85%] sm:max-w-[70%]">
                <div className="bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-2xl rounded-br-md px-4 py-3 shadow-lg">
                    <p className="text-sm sm:text-base leading-relaxed break-words">{content}</p>
                    <div className="text-xs text-cyan-100 mt-1 opacity-75">
                        {formatTime(timestamp)}
                    </div>
                </div>
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 flex items-center justify-center flex-shrink-0">
                    <i className="fa-solid fa-user text-white text-xs"></i>
                </div>
            </div>
        </div>
    );

    const AIMessage = ({ content, timestamp, isTypingAnimation = false }) => (
        <div className="flex justify-start mb-4" style={{ animation: 'slideInLeft 0.3s ease-out' }}>
            <div className="flex items-end space-x-2 max-w-[85%] sm:max-w-[70%]">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-indigo-600 flex items-center justify-center flex-shrink-0">
                    <i className="fa-solid fa-robot text-white text-xs"></i>
                </div>
                <div className="bg-slate-800/80 backdrop-blur-sm border border-blue-800/30 text-slate-100 rounded-2xl rounded-bl-md px-4 py-3 shadow-lg">
                    <div className="prose prose-invert prose-sm sm:prose-base max-w-none">
                        <ReactMarkdown 
                            rehypePlugins={[rehypeHighlight]}
                            components={{
                                code: ({node, inline, className, children, ...props}) => {
                                    const match = /language-(\w+)/.exec(className || '');
                                    return !inline && match ? (
                                        <div className="relative">
                                            <div className="flex items-center justify-between bg-slate-900/50 px-3 py-2 rounded-t-lg border-b border-slate-600/30">
                                                <span className="text-xs text-slate-400 font-medium">{match[1]}</span>
                                                <button 
                                                    onClick={() => navigator.clipboard.writeText(String(children).replace(/\n$/, ''))}
                                                    className="text-xs text-slate-400 hover:text-cyan-400 transition-colors duration-200"
                                                >
                                                    <i className="fa-solid fa-copy"></i>
                                                </button>
                                            </div>
                                            <code className={`${className} block p-3 rounded-t-none`} {...props}>
                                                {children}
                                            </code>
                                        </div>
                                    ) : (
                                        <code className="bg-slate-700/50 px-1.5 py-0.5 rounded text-cyan-300" {...props}>
                                            {children}
                                        </code>
                                    );
                                },
                                p: ({children}) => <p className="mb-2 last:mb-0 leading-relaxed">{children}</p>,
                                ul: ({children}) => <ul className="list-disc list-inside space-y-1 mb-2">{children}</ul>,
                                ol: ({children}) => <ol className="list-decimal list-inside space-y-1 mb-2">{children}</ol>,
                                h1: ({children}) => <h1 className="text-xl font-bold mb-2 text-cyan-300">{children}</h1>,
                                h2: ({children}) => <h2 className="text-lg font-bold mb-2 text-cyan-300">{children}</h2>,
                                h3: ({children}) => <h3 className="text-base font-bold mb-2 text-cyan-300">{children}</h3>,
                                blockquote: ({children}) => (
                                    <blockquote className="border-l-4 border-cyan-500/50 pl-4 italic text-slate-300 my-2">
                                        {children}
                                    </blockquote>
                                ),
                                a: ({children, href}) => (
                                    <a href={href} className="text-cyan-400 hover:text-cyan-300 underline transition-colors duration-200" target="_blank" rel="noopener noreferrer">
                                        {children}
                                    </a>
                                )
                            }}
                        >
                            {content}
                        </ReactMarkdown>
                    </div>
                    {isTypingAnimation && (
                        <div className="flex items-center space-x-1 mt-2">
                            <div className="flex space-x-1">
                                <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce"></div>
                                <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                                <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                            </div>
                        </div>
                    )}
                    <div className="text-xs text-slate-400 mt-2 opacity-75">
                        {formatTime(timestamp)}
                    </div>
                </div>
            </div>
        </div>
    );

    const EmptyState = () => (
        <div className="flex flex-col items-center justify-center h-full text-center px-4 py-8">
            <div className="w-20 h-20 rounded-full bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 flex items-center justify-center mb-6">
                <i className="fa-solid fa-comments text-cyan-400 text-2xl">U</i>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold mb-2 bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                Start a New Conversation
            </h2>
            <p className="text-slate-400 text-sm sm:text-base mb-6 max-w-md">
                Ask me anything! I'm here to help with your questions, coding, creative writing, and more.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-2xl">
                {[
                    { icon: "fa-code", text: "Help with coding", color: "from-green-500 to-emerald-600" },
                    { icon: "fa-lightbulb", text: "Creative ideas", color: "from-yellow-500 to-orange-600" },
                    { icon: "fa-book", text: "Explain concepts", color: "from-purple-500 to-violet-600" },
                    { icon: "fa-calculator", text: "Solve problems", color: "from-red-500 to-pink-600" }
                ].map((item, idx) => (
                    <div key={idx} className="p-4 rounded-lg bg-slate-800/30 border border-slate-700/50 hover:border-cyan-500/30 transition-colors duration-200">
                        <div className={`w-8 h-8 rounded-lg bg-gradient-to-r ${item.color} flex items-center justify-center mb-2`}>
                            <i className={`fa-solid ${item.icon} text-white text-sm`}></i>
                        </div>
                        <p className="text-sm text-slate-300">{item.text}</p>
                    </div>
                ))}
            </div>
        </div>
    );

    return (
        <div className="flex flex-col h-full bg-gradient-to-br from-slate-900/50 via-blue-950/50 to-slate-900/50">
            {newChat ? (
                <EmptyState />
            ) : (
                <div 
                    ref={chatContainerRef}
                    className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 space-y-1 scrollbar-thin scrollbar-track-slate-900 scrollbar-thumb-slate-700"
                >
                    {/* Previous Chats */}
                    {prevChats?.slice(0, -1).map((chat, idx) => 
                        chat.role === "user" ? (
                            <UserMessage 
                                key={idx} 
                                content={chat.content} 
                                timestamp={chat.timestamp}
                            />
                        ) : (
                            <AIMessage 
                                key={idx} 
                                content={chat.content} 
                                timestamp={chat.timestamp}
                            />
                        )
                    )}

                    {/* Latest Reply with Typing Effect */}
                    {prevChats.length > 0 && (
                        latestReply === null ? (
                            <AIMessage 
                                content={prevChats[prevChats.length-1].content} 
                                timestamp={prevChats[prevChats.length-1].timestamp}
                            />
                        ) : (
                            <AIMessage 
                                content={latestReply} 
                                timestamp={Date.now()}
                                isTypingAnimation={isTyping}
                            />
                        )
                    )}

                    {/* Auto-scroll anchor */}
                    <div ref={chatEndRef} />
                </div>
            )}
        </div>
    );
}

export default Chat;
