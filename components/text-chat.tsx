"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { TextField, Button, CircularProgress, Typography, Paper, Alert } from "@mui/material"
import { Send } from "lucide-react"
import ReactMarkdown from "react-markdown"
import { getLanguageFromText } from "@/utils/language-detector"

export default function TextChat() {
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [messages, setMessages] = useState<Array<{ role: string; content: string; language?: string }>>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Add bilingual initial greeting message
    const initialMessage = {
      role: "assistant",
      content:
        "Hello! I'm a foot pressure medical advisor. How can I help you with your foot pressure concerns today?\n\nสวัสดี! ฉันเป็นผู้เชี่ยวชาญด้านแรงกดฝ่าเท้า คุณมีคำถามอะไรเกี่ยวกับแรงกดฝ่าเท้าไหม?",
      language: "both",
    }

    setMessages([initialMessage])
  }, [])

  // Scroll to bottom whenever messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value)
    // Clear any previous errors when user starts typing
    if (error) setError(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!input.trim()) return

    // Detect language from input
    const detectedLanguage = getLanguageFromText(input)

    // Add user message with detected language
    const userMessage = {
      role: "user",
      content: input,
      language: detectedLanguage,
    }

    setMessages((prev) => [...prev, userMessage])

    // Clear input and set loading
    setInput("")
    setIsLoading(true)
    setError(null)

    try {
      console.log("Sending message to API:", {
        messages: [...messages, userMessage],
        language: detectedLanguage,
      })

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [...messages, userMessage],
          language: detectedLanguage,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.details || `Error: ${response.status}`)
      }

      // Add assistant response with the same language
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: data.response,
          language: detectedLanguage,
        },
      ])
    } catch (error) {
      console.error("Error sending message:", error)
      setError(error instanceof Error ? error.message : String(error))

      // Error message in the detected language
      const errorMessage =
        detectedLanguage === "th"
          ? "ขออภัย เกิดข้อผิดพลาดในการประมวลผลข้อความของคุณ โปรดลองอีกครั้ง"
          : "Sorry, there was an error processing your message. Please try again."

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: errorMessage,
          language: detectedLanguage,
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  // Placeholder text based on the last detected language or default to both
  const getPlaceholderText = () => {
    const lastMessage = [...messages].reverse().find((msg) => msg.language && msg.language !== "both")

    if (lastMessage?.language === "th") {
      return "พิมพ์คำถามเกี่ยวกับแรงกดฝ่าเท้าของคุณที่นี่..."
    } else if (lastMessage?.language === "en") {
      return "Type your foot pressure question here..."
    } else {
      return "Type your question in English or Thai / พิมพ์คำถามของคุณเป็นภาษาอังกฤษหรือไทย"
    }
  }

  return (
    <div className="flex flex-col h-[60vh]">
      <div className="flex-1 overflow-y-auto mb-4 p-2 rounded-lg bg-gray-50 dark:bg-slate-900/50">
        {messages.map((message, index) => (
          <div key={index} className={`mb-3 ${message.role === "user" ? "text-right" : "text-left"}`}>
            <Paper
              elevation={0}
              className={`p-3 inline-block max-w-[85%] rounded-2xl shadow-sm transition-all duration-200 ${
                message.role === "user"
                  ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white"
                  : "bg-white dark:bg-slate-800"
              }`}
            >
              {message.role === "user" ? (
                <Typography variant="body1">{message.content}</Typography>
              ) : (
                <div className="prose dark:prose-invert prose-sm max-w-none">
                  <ReactMarkdown>{message.content}</ReactMarkdown>
                </div>
              )}
            </Paper>
          </div>
        ))}
        {isLoading && (
          <div className="text-left mb-3">
            <Paper elevation={0} className="p-3 bg-white dark:bg-slate-800 inline-block rounded-2xl shadow-sm">
              <div className="flex items-center space-x-2">
                <CircularProgress size={16} className="text-blue-500" />
                <Typography variant="body2" className="text-gray-500 dark:text-gray-400">
                  {getLanguageFromText(input) === "th" ? "กำลังพิมพ์..." : "Thinking..."}
                </Typography>
              </div>
            </Paper>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {error && (
        <Alert severity="error" className="mb-4 rounded-lg">
          {error}
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="flex space-x-2">
        <TextField
          fullWidth
          variant="outlined"
          placeholder={getPlaceholderText()}
          value={input}
          onChange={handleInputChange}
          disabled={isLoading}
          size="small"
          className="rounded-full"
          InputProps={{
            className: "rounded-full bg-white dark:bg-slate-800 shadow-sm",
          }}
        />
        <Button
          type="submit"
          variant="contained"
          color="primary"
          disabled={isLoading || !input.trim()}
          className="min-w-[50px] rounded-full shadow-sm"
          sx={{
            minWidth: "50px",
            borderRadius: "9999px",
            boxShadow: "none",
          }}
        >
          <Send size={20} />
        </Button>
      </form>
    </div>
  )
}
