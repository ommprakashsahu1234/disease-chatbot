import Chat from "./Chat.jsx";
import { MyContext } from "../MyContext.jsx";
import { useContext, useState, useEffect, useRef } from "react";
import { ScaleLoader } from "react-spinners";
import useCooldownTimer from "../hooks/useCooldownTimer.jsx";

function ChatWindow() {
    const {prompt, setPrompt, reply, setReply, currThreadId, setPrevChats, setNewChat} = useContext(MyContext);
    const [loading, setLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);
    const userIconRef = useRef(null);
    
    // 21-second cooldown timer
    const { timeLeft, startTimer, isOnCooldown } = useCooldownTimer(21);

    const getReply = async () => {
        if (isOnCooldown || loading) return;
        
        setLoading(true);
        setNewChat(false);

        console.log("message ", prompt, " threadId ", currThreadId);
        const options = {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                message: prompt,
                threadId: currThreadId
            })
        };

        try {
            const response = await fetch("http://localhost:8080/api/chat", options);
            const res = await response.json();
            console.log(res);
            setReply(res.reply);
        } catch(err) {
            console.log(err);
        }
        setLoading(false);
    }

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target) && 
                userIconRef.current && !userIconRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    // Append new chat to prevChats and START TIMER after response is complete
    useEffect(() => {
        if(prompt && reply) {
            setPrevChats(prevChats => (
                [...prevChats, {
                    role: "user",
                    content: prompt
                },{
                    role: "assistant",
                    content: reply
                }]
            ));
            
            // Start the 21-second cooldown timer AFTER response is generated
            startTimer();
        }
        setPrompt("");
    }, [reply]); // Removed startTimer from dependency array

    const handleProfileClick = () => {
        setIsOpen(!isOpen);
    }

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            if (prompt.trim() && !isOnCooldown && !loading) {
                getReply();
            }
        }
    }

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className="flex flex-col h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white relative">
            {/* Navbar */}
            <div className="flex items-center justify-between px-4 sm:px-6 py-3 bg-slate-900/50 backdrop-blur-sm border-b border-blue-800/30 relative z-10">
                <div className="flex items-center space-x-2">
                    <span className="text-lg sm:text-xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                        Nexa
                    </span>
                    <i className="fa-solid fa-chevron-down text-cyan-400 text-sm transition-transform duration-200 hover:scale-110"></i>
                </div>
                
                <div className="relative">
                    <div 
                        ref={userIconRef}
                        className="w-10 h-10 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 flex items-center justify-center cursor-pointer transition-all duration-200 hover:scale-105 hover:shadow-lg hover:shadow-cyan-500/25"
                        onClick={handleProfileClick}
                    >
                        <i className="fa-solid fa-user text-white text-sm"></i>
                    </div>
                    
                    {/* Dropdown Menu */}
                    {isOpen && (
                        <div 
                            ref={dropdownRef}
                            className="absolute right-0 top-12 w-48 bg-slate-800/95 backdrop-blur-sm rounded-lg shadow-2xl border border-blue-800/30 py-2 z-50"
                            style={{
                                animation: 'slideInTop 0.2s ease-out'
                            }}
                        >
                            <div className="px-4 py-2 text-xs text-slate-400 border-b border-slate-700/50">
                                Account Options
                            </div>
                            <div className="flex items-center space-x-3 px-4 py-3 hover:bg-slate-700/50 cursor-pointer transition-colors duration-150">
                                <i className="fa-solid fa-gear text-cyan-400"></i>
                                <span className="text-sm">Settings</span>
                            </div>
                            <div className="flex items-center space-x-3 px-4 py-3 hover:bg-slate-700/50 cursor-pointer transition-colors duration-150">
                                <i className="fa-solid fa-cloud-arrow-up text-green-400"></i>
                                <span className="text-sm">Upgrade plan</span>
                            </div>
                            <div className="flex items-center space-x-3 px-4 py-3 hover:bg-red-600/20 cursor-pointer transition-colors duration-150 text-red-400">
                                <i className="fa-solid fa-arrow-right-from-bracket"></i>
                                <span className="text-sm">Log out</span>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-hidden relative">
                <Chat />
                
                {/* Loading Overlay */}
                {loading && (
                    <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-40">
                        <div className="bg-slate-800/80 rounded-lg p-6 flex flex-col items-center space-y-4">
                            <ScaleLoader color="#06b6d4" loading={loading} />
                            <p className="text-cyan-400 text-sm">Generating response...</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Chat Input */}
            <div className="px-4 sm:px-6 py-4 bg-slate-900/50 backdrop-blur-sm border-t border-blue-800/30">
                <div className="max-w-4xl mx-auto">
                    {/* Cooldown Timer Display */}
                    {isOnCooldown && (
                        <div className="mb-3 text-center">
                            <div className="inline-flex items-center space-x-2 bg-orange-500/10 border border-orange-500/30 rounded-lg px-3 py-2">
                                <i className="fa-solid fa-clock text-orange-400 text-sm"></i>
                                <span className="text-orange-400 text-sm font-medium">
                                    Please wait {formatTime(timeLeft)} before sending another message
                                </span>
                            </div>
                        </div>
                    )}
                    
                    <div className={`relative flex items-center rounded-xl border transition-colors duration-200 ${
                        isOnCooldown 
                            ? 'bg-slate-800/30 border-slate-600/50 opacity-50' 
                            : loading
                            ? 'bg-slate-800/30 border-blue-600/50 opacity-70'
                            : 'bg-slate-800/50 border-blue-800/30 hover:border-cyan-500/50 focus-within:border-cyan-500 focus-within:shadow-lg focus-within:shadow-cyan-500/10'
                    }`}>
                        <input
                            type="text"
                            placeholder={
                                loading 
                                    ? "Generating response..." 
                                    : isOnCooldown 
                                    ? `Wait ${timeLeft}s to send another message...` 
                                    : "Ask anything..."
                            }
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            onKeyDown={handleKeyDown}
                            disabled={loading || isOnCooldown}
                            className={`flex-1 px-4 py-3 sm:py-4 bg-transparent text-white placeholder-slate-400 focus:outline-none text-sm sm:text-base transition-opacity duration-200 ${
                                (loading || isOnCooldown) ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                        />
                        <button
                            onClick={getReply}
                            disabled={loading || !prompt.trim() || isOnCooldown}
                            className={`m-2 w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center transition-all duration-200 ${
                                loading
                                    ? 'bg-blue-600/50 opacity-70 cursor-not-allowed'
                                    : (isOnCooldown || !prompt.trim())
                                    ? 'bg-slate-600 opacity-50 cursor-not-allowed'
                                    : 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:scale-105 hover:shadow-lg hover:shadow-cyan-500/25'
                            }`}
                        >
                            {loading ? (
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            ) : isOnCooldown ? (
                                <span className="text-white text-xs font-bold">{timeLeft}</span>
                            ) : (
                                <i className="fa-solid fa-paper-plane text-white text-xs sm:text-sm"></i>
                            )}
                        </button>
                    </div>
                    
                    <p className="text-center text-xs text-slate-500 mt-3 px-2">
                        {loading ? (
                            <span className="text-blue-400">
                                <i className="fa-solid fa-brain mr-1"></i>
                                AI is generating your response...
                            </span>
                        ) : isOnCooldown ? (
                            <span className="text-orange-400">
                                <i className="fa-solid fa-hourglass-half mr-1"></i>
                                Cooldown active to prevent spam
                            </span>
                        ) : (
                            <>
                                SigmaGPT can make mistakes. Check important info. 
                                <span className="hidden sm:inline"> See Cookie Preferences.</span>
                            </>
                        )}
                    </p>
                </div>
            </div>
        </div>
    );
}

export default ChatWindow;
