import Sidebar from './components/Sidebar.jsx'
import ChatWindow from './components/ChatWindow.jsx'
import { MyContext } from "./MyContext.jsx"
import { useState } from 'react'
import { v1 as uuidv1 } from "uuid"

function App() {
  const [prompt, setPrompt] = useState("")
  const [reply, setReply] = useState(null)
  const [currThreadId, setCurrThreadId] = useState(uuidv1())
  const [prevChats, setPrevChats] = useState([])
  const [newChat, setNewChat] = useState(true)
  const [allThreads, setAllThreads] = useState([])

  const providerValues = {
    prompt,
    setPrompt,
    reply,
    setReply,
    currThreadId,
    setCurrThreadId,
    newChat,
    setNewChat,
    prevChats,
    setPrevChats,
    allThreads,
    setAllThreads,
  }

  return (
    <MyContext.Provider value={providerValues}>
      <div className="flex h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white overflow-hidden">
        <Sidebar />
        <div className="flex-1 relative">
          <ChatWindow />
        </div>
      </div>
    </MyContext.Provider>
  )
}

export default App
