"use client"

import { useState } from "react"
import { Box } from "@mui/material"
import { MessageCircle, Mic } from "lucide-react"
import TextChat from "./text-chat"
import VoiceChat from "./voice-chat"

export default function ChatTabs() {
  const [activeTab, setActiveTab] = useState(0)

  const handleTabChange = (tabIndex: number) => {
    setActiveTab(tabIndex)
  }

  return (
    <Box className="bg-white dark:bg-slate-800 rounded-xl shadow-lg overflow-hidden transition-all duration-300">
      <div className="flex border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => handleTabChange(0)}
          className={`flex items-center px-6 py-4 font-medium text-sm rounded-t-lg transition-all duration-200 flex-1 justify-center ${
            activeTab === 0
              ? "text-blue-600 border-b-2 border-blue-600 dark:text-blue-400 dark:border-blue-400 bg-blue-50/50 dark:bg-blue-900/20"
              : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/20"
          }`}
        >
          <MessageCircle className="mr-2 h-5 w-5" />
          Text Chat
        </button>
        <button
          onClick={() => handleTabChange(1)}
          className={`flex items-center px-6 py-4 font-medium text-sm rounded-t-lg transition-all duration-200 flex-1 justify-center ${
            activeTab === 1
              ? "text-blue-600 border-b-2 border-blue-600 dark:text-blue-400 dark:border-blue-400 bg-blue-50/50 dark:bg-blue-900/20"
              : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/20"
          }`}
        >
          <Mic className="mr-2 h-5 w-5" />
          Voice Chat
        </button>
      </div>

      <div className="p-4">
        {activeTab === 0 && <TextChat />}
        {activeTab === 1 && <VoiceChat />}
      </div>
    </Box>
  )
}
