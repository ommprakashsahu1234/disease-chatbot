import { useContext, useEffect, useState } from "react";
import { MyContext } from "../MyContext.jsx";
import { v1 as uuidv1 } from "uuid";

function Sidebar() {
    const {allThreads, setAllThreads, currThreadId, setNewChat, setPrompt, setReply, setCurrThreadId, setPrevChats} = useContext(MyContext);
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    // Check if mobile view
    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
            if (window.innerWidth < 768) {
                setIsCollapsed(true);
            }
        };
        
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    const getAllThreads = async () => {
        try {
            const response = await fetch("http://localhost:8080/api/threads");
            const res = await response.json();
            console.log("API /thread response:", res);
            const filteredData = res.map(thread => ({
                threadId: thread.threadId || thread.id || thread._id,
                title: thread.title || thread.name || "Untitled"
            }));
            setAllThreads(filteredData);
        } catch (err) {
            console.log(err);
        }
    };

    useEffect(() => {
        getAllThreads();
    }, [currThreadId]);

    const createNewChat = () => {
        setNewChat(true);
        setPrompt("");
        setReply(null);
        setCurrThreadId(uuidv1());
        setPrevChats([]);
    };

    const changeThread = async (newThreadId) => {
        setCurrThreadId(newThreadId);
        try {
            const response = await fetch(`http://localhost:8080/api/threads/${newThreadId}`);
            const res = await response.json();
            console.log(res);
            setPrevChats(res);
            setNewChat(false);
            setReply(null);
        } catch(err) {
            console.log(err);
        }
    };

    const deleteThread = async (threadId, e) => {
        e?.stopPropagation();
        try {
            const response = await fetch(`http://localhost:8080/api/threads/${threadId}`, {method: "DELETE"});
            const res = await response.text();
            console.log(res);

            setAllThreads(prev => prev.filter(thread => thread.threadId !== threadId));

            if(threadId === currThreadId) {
                createNewChat();
            }
        } catch(err) {
            console.log(err);
        }
    };

    const toggleSidebar = () => {
        setIsCollapsed(!isCollapsed);
    };

    return (
        <>
            {/* Mobile Overlay */}
            {isMobile && !isCollapsed && (
                <div 
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
                    onClick={() => setIsCollapsed(true)}
                />
            )}

            {/* Sidebar */}
            <section className={`
                fixed left-0 top-0 h-full bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 
                border-r border-blue-800/30 z-50 transition-all duration-300 ease-in-out
                ${isCollapsed ? 'w-0 -translate-x-full' : 'w-80 translate-x-0'}
                ${isMobile ? 'shadow-2xl' : ''}
                lg:relative lg:translate-x-0 lg:shadow-none
            `}>
                
                <div className="flex flex-col h-full text-white overflow-hidden">
                    
                    {/* Header */}
                    <div className="p-4 border-b border-blue-800/30">
                        <button
                            onClick={createNewChat}
                            className="w-full flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 transition-all duration-200 hover:scale-[1.02] hover:shadow-lg hover:shadow-cyan-500/25 group"
                        >
                            <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                                    <img src="/logo.png" alt="logo" className="w-6 h-6 rounded object-cover" />
                                </div>
                                <span className="font-medium text-sm">New Chat</span>
                            </div>
                            <i className="fa-solid fa-pen-to-square text-sm group-hover:scale-110 transition-transform duration-200"></i>
                        </button>
                    </div>

                    {/* Chat History */}
                    <div className="flex-1 overflow-y-auto px-2 py-4 scrollbar-thin scrollbar-track-slate-900 scrollbar-thumb-slate-700">
                        <div className="space-y-1">
                            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wide px-3 mb-3">
                                Recent Chats
                            </h3>
                            
                            {allThreads?.length === 0 ? (
                                <div className="px-3 py-8 text-center">
                                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-800/50 flex items-center justify-center">
                                        <i className="fa-solid fa-comments text-slate-500 text-xl"></i>
                                    </div>
                                    <p className="text-slate-500 text-sm">No conversations yet</p>
                                    <p className="text-slate-600 text-xs mt-1">Start a new chat to begin</p>
                                </div>
                            ) : (
                                <ul className="space-y-1">
                                    {allThreads.map((thread, idx) => (
                                        <li key={idx} className="group">
                                            <div
                                                onClick={() => changeThread(thread.threadId)}
                                                className={`
                                                    flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all duration-200
                                                    ${thread.threadId === currThreadId 
                                                        ? 'bg-gradient-to-r from-cyan-600/20 to-blue-600/20 border border-cyan-500/30 text-cyan-100' 
                                                        : 'hover:bg-slate-700/50 text-slate-300 hover:text-white'
                                                    }
                                                `}
                                            >
                                                <div className="flex items-center space-x-3 flex-1 min-w-0">
                                                    <div className={`w-2 h-2 rounded-full transition-colors duration-200 ${
                                                        thread.threadId === currThreadId ? 'bg-cyan-400' : 'bg-slate-600'
                                                    }`}></div>
                                                    <span className="text-sm truncate flex-1">
                                                        {thread.title}
                                                    </span>
                                                </div>
                                                
                                                <button
                                                    onClick={(e) => deleteThread(thread.threadId, e)}
                                                    className="opacity-0 group-hover:opacity-100 p-2 hover:bg-red-500/20 rounded-md transition-all duration-200 hover:scale-110 text-red-400 hover:text-red-300"
                                                    title="Delete thread"
                                                >
                                                    <i className="fa-solid fa-trash text-xs"></i>
                                                </button>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="p-4 border-t border-blue-800/30 bg-slate-900/50">
                        <div className="text-center">
                            <p className="text-xs text-slate-500">
                                Made with <span className="text-red-400 animate-pulse">♥</span> by 
                                <span className="text-cyan-400 font-medium ml-1">The Binary Brains</span>
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Toggle Button */}
            <button
                onClick={toggleSidebar}
                className={`
                    fixed top-4 left-4 z-[60] w-10 h-10 rounded-lg bg-slate-800/80 backdrop-blur-sm 
                    border border-blue-800/30 flex items-center justify-center text-cyan-400 
                    transition-all duration-200 hover:scale-110 hover:bg-slate-700/80 hover:shadow-lg hover:shadow-cyan-500/25
                    ${!isCollapsed && !isMobile ? 'opacity-0 pointer-events-none' : 'opacity-100'}
                    lg:${isCollapsed ? 'block' : 'hidden'}
                `}
                title={isCollapsed ? 'Open sidebar' : 'Close sidebar'}
            >
                <i className={`fa-solid transition-transform duration-200 ${
                    isCollapsed ? 'fa-bars' : 'fa-xmark'
                }`}></i>
            </button>
        </>
    );
}

export default Sidebar;
