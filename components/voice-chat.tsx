"use client"

import { useState, useEffect, useRef } from "react"
import { Button, Typography, Paper, CircularProgress, ButtonGroup } from "@mui/material"
import { Mic, MicOff, Volume2, Square } from "lucide-react"
import ReactMarkdown from "react-markdown"

// Add these type declarations
declare global {
  interface Window {
    SpeechRecognition: any
    webkitSpeechRecognition: any
  }
}

export default function VoiceChat() {
  const [isRecording, setIsRecording] = useState(false)
  const [transcript, setTranscript] = useState("")
  const [response, setResponse] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [currentLanguage, setCurrentLanguage] = useState<"en" | "th">("en")
  const [messages, setMessages] = useState<{ role: string; content: string; language?: string }[]>([])
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [recognitionStatus, setRecognitionStatus] = useState<string>("")

  // Single recognition reference
  const recognitionRef = useRef<any>(null)

  // Track if we've detected Thai in the current session
  const detectedThaiRef = useRef(false)

  useEffect(() => {
    // Add bilingual initial greeting message
    const initialMessage = {
      role: "assistant",
      content:
        "Hello! I'm a foot pressure medical advisor. You can speak your question in English or Thai.\n\nสวัสดี! ฉันเป็นผู้เชี่ยวชาญด้านแรงกดฝ่าเท้า คุณสามารถพูดคำถามของคุณเป็นภาษาอังกฤษหรือไทยได้",
      language: "both",
    }

    setMessages([initialMessage])

    return () => {
      stopRecognition()
    }
  }, [])

  // Initialize speech recognition for a specific language
  const initSpeechRecognition = (language: "en" | "th") => {
    if (!("SpeechRecognition" in window) && !("webkitSpeechRecognition" in window)) {
      alert("Speech recognition is not supported in this browser.")
      setRecognitionStatus("Speech recognition not supported")
      return null
    }

    // Stop any existing recognition
    stopRecognition()

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    const recognition = new SpeechRecognition()

    // Configure recognition
    recognition.continuous = true
    recognition.interimResults = true
    recognition.lang = language === "th" ? "th-TH" : "en-US"

    recognition.onstart = () => {
      console.log(`Started ${language} recognition`)
      setRecognitionStatus(`Listening in ${language === "th" ? "Thai" : "English"}`)
    }

    recognition.onresult = (event) => {
      const newTranscript = Array.from(event.results)
        .map((result) => result[0])
        .map((result) => result.transcript)
        .join("")

      setTranscript(newTranscript)

      // Check for Thai characters
      const hasThaiChars = /[\u0E00-\u0E7F]/.test(newTranscript)

      // If we detect Thai characters and we're not already in Thai mode
      if (hasThaiChars && language !== "th") {
        detectedThaiRef.current = true
        setRecognitionStatus("Detected Thai, switching language...")

        // Switch to Thai
        switchLanguage("th")
      }

      // If we're in Thai mode but haven't detected any Thai characters after a while
      if (language === "th" && !hasThaiChars && newTranscript.length > 10) {
        setRecognitionStatus("No Thai detected, switching to English...")

        // Switch back to English
        switchLanguage("en")
      }
    }

    recognition.onerror = (event) => {
      console.error(`${language} recognition error:`, event.error)

      // Don't treat "aborted" as a fatal error, it happens when we switch languages
      if (event.error === "aborted") {
        setRecognitionStatus(`Recognition was aborted, restarting...`)

        // If we're still recording, restart after a short delay
        if (isRecording) {
          setTimeout(() => {
            if (isRecording) {
              initSpeechRecognition(language)
              startRecognition()
            }
          }, 300)
        }
      } else {
        setRecognitionStatus(`Error in ${language} recognition: ${event.error}`)

        // For other errors, try switching languages
        if (language === "en" && isRecording) {
          switchLanguage("th")
        } else if (language === "th" && isRecording) {
          switchLanguage("en")
        }
      }
    }

    recognition.onend = () => {
      console.log(`${language} recognition ended`)

      // If we're still supposed to be recording, restart it
      if (isRecording) {
        try {
          recognition.start()
        } catch (e) {
          console.error(`Error restarting ${language} recognition:`, e)

          // If we can't restart, try switching languages
          if (language === "en") {
            switchLanguage("th")
          } else {
            switchLanguage("en")
          }
        }
      }
    }

    recognitionRef.current = recognition
    return recognition
  }

  // Start recognition
  const startRecognition = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.start()
      } catch (e) {
        console.error("Error starting recognition:", e)
        setRecognitionStatus(`Error starting: ${e.message}`)
      }
    }
  }

  // Stop recognition
  const stopRecognition = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop()
      } catch (e) {
        console.log("Error stopping recognition:", e)
      }
    }
  }

  // Switch language
  const switchLanguage = (language: "en" | "th") => {
    setCurrentLanguage(language)

    if (isRecording) {
      stopRecognition()
      initSpeechRecognition(language)
      startRecognition()
    }

    setRecognitionStatus(`Switched to ${language === "th" ? "Thai" : "English"}`)
  }

  // Scroll to bottom whenever messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording()
    } else {
      startRecording()
    }
  }

  const startRecording = () => {
    setTranscript("")
    setIsRecording(true)
    detectedThaiRef.current = false
    setRecognitionStatus("Starting recognition...")

    // Use the currently selected language
    initSpeechRecognition(currentLanguage)
    startRecognition()
  }

  const stopRecording = async () => {
    setIsRecording(false)
    setRecognitionStatus("Stopped recording")

    // Stop recognition
    stopRecognition()

    // Determine language based on content and current language
    const finalLanguage = detectedThaiRef.current || currentLanguage === "th" ? "th" : "en"

    if (transcript.trim()) {
      // Add user message to chat
      setMessages((prev) => [
        ...prev,
        {
          role: "user",
          content: transcript,
          language: finalLanguage,
        },
      ])

      // Process with Gemini
      setIsProcessing(true)
      setRecognitionStatus(`Processing in ${finalLanguage === "th" ? "Thai" : "English"}...`)

      try {
        const response = await fetch("/api/voice-chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            message: transcript,
            language: finalLanguage,
          }),
        })

        const data = await response.json()
        setResponse(data.response)
        setRecognitionStatus("Received response")

        // Add assistant response to chat
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: data.response,
            language: finalLanguage,
          },
        ])

        // Speak the response
        speakResponse(data.response, finalLanguage)
      } catch (error) {
        console.error("Error processing voice message:", error)
        setRecognitionStatus(`Error: ${error.message}`)
      } finally {
        setIsProcessing(false)
      }
    } else {
      setRecognitionStatus("No transcript to process")
    }
  }

  const speakResponse = (text: string, language: string) => {
    if ("speechSynthesis" in window) {
      // Remove markdown for speech
      const plainText = text
        .replace(/\*\*(.*?)\*\*/g, "$1") // Remove bold
        .replace(/\*(.*?)\*/g, "$1") // Remove italic
        .replace(/\[(.*?)\]$$.*?$$/g, "$1") // Remove links
        .replace(/#{1,6}\s?(.*?)$/gm, "$1") // Remove headings
        .replace(/\n- /g, ". ") // Convert list items to sentences

      const utterance = new SpeechSynthesisUtterance(plainText)
      utterance.lang = language === "th" ? "th-TH" : "en-US"
      utterance.rate = 0.9 // Slightly slower for better comprehension

      utterance.onstart = () => {
        setIsSpeaking(true)
        setRecognitionStatus("Speaking response")
      }

      utterance.onend = () => {
        setIsSpeaking(false)
        setRecognitionStatus("Finished speaking")
      }

      window.speechSynthesis.speak(utterance)
    }
  }

  const stopSpeaking = () => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel()
      setIsSpeaking(false)
      setRecognitionStatus("Stopped speaking")
    }
  }

  // Add this new function to handle language selection
  const selectLanguage = (language: "en" | "th") => {
    setCurrentLanguage(language)
    setRecognitionStatus(`Selected ${language === "th" ? "Thai" : "English"} language`)

    if (isRecording) {
      // If already recording, restart with new language
      stopRecognition()
      initSpeechRecognition(language)
      startRecognition()
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

        {isProcessing && (
          <div className="text-left mb-3">
            <Paper elevation={0} className="p-3 bg-white dark:bg-slate-800 inline-block rounded-2xl shadow-sm">
              <div className="flex items-center space-x-2">
                <CircularProgress size={16} className="text-blue-500" />
                <Typography variant="body2" className="text-gray-500 dark:text-gray-400">
                  {currentLanguage === "th" ? "กำลังประมวลผล..." : "Processing..."}
                </Typography>
              </div>
            </Paper>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <div className="flex flex-col space-y-4">
        {isRecording && (
          <Paper
            elevation={0}
            className="p-4 rounded-xl bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 border border-red-100 dark:border-red-800/30 shadow-sm"
          >
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center">
                <span className="w-3 h-3 bg-red-500 rounded-full animate-pulse mr-2"></span>
                <Typography variant="body2" className="font-medium text-red-600 dark:text-red-400">
                  {currentLanguage === "th" ? "กำลังบันทึกเสียง..." : "Recording..."}
                </Typography>
              </div>
              <Typography variant="caption" className="text-gray-500 dark:text-gray-400 font-medium">
                {currentLanguage === "th" ? "ภาษาไทย" : "English"}
              </Typography>
            </div>
            {transcript && (
              <Typography variant="body1" className="mt-2 text-gray-800 dark:text-gray-200">
                {transcript}
              </Typography>
            )}
            <Typography variant="caption" className="text-gray-500 dark:text-gray-400 mt-2 block">
              {recognitionStatus}
            </Typography>
          </Paper>
        )}

        {/* Language selection buttons */}
        <div className="flex justify-center mb-2">
          <ButtonGroup
            variant="outlined"
            aria-label="language selection"
            className="rounded-full overflow-hidden shadow-sm"
          >
            <Button
              onClick={() => selectLanguage("en")}
              variant={currentLanguage === "en" ? "contained" : "outlined"}
              className={`px-6 py-2 transition-all duration-300 ${
                currentLanguage === "en"
                  ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white border-none"
                  : "text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800"
              }`}
              sx={{
                borderRadius: "9999px 0 0 9999px",
                boxShadow: "none",
              }}
            >
              English
            </Button>
            <Button
              onClick={() => selectLanguage("th")}
              variant={currentLanguage === "th" ? "contained" : "outlined"}
              className={`px-6 py-2 transition-all duration-300 ${
                currentLanguage === "th"
                  ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white border-none"
                  : "text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800"
              }`}
              sx={{
                borderRadius: "0 9999px 9999px 0",
                boxShadow: "none",
              }}
            >
              ภาษาไทย
            </Button>
          </ButtonGroup>
        </div>

        <div className="flex justify-center space-x-3">
          <Button
            variant="contained"
            color={isRecording ? "error" : "primary"}
            onClick={toggleRecording}
            startIcon={isRecording ? <MicOff /> : <Mic />}
            disabled={isProcessing}
            className={`rounded-full shadow-sm transition-all duration-300 px-6 ${
              isRecording ? "bg-gradient-to-r from-red-500 to-red-600" : "bg-gradient-to-r from-blue-500 to-blue-600"
            }`}
            sx={{
              borderRadius: "9999px",
              boxShadow: "none",
              textTransform: "none",
              fontWeight: 500,
            }}
          >
            {isRecording
              ? currentLanguage === "th"
                ? "หยุดบันทึก"
                : "Stop"
              : currentLanguage === "th"
                ? "เริ่มบันทึก"
                : "Start"}
          </Button>

          {isSpeaking && (
            <Button
              variant="outlined"
              onClick={stopSpeaking}
              startIcon={<Square />}
              className="rounded-full border-amber-300 dark:border-amber-700 text-amber-600 dark:text-amber-400"
              sx={{
                borderRadius: "9999px",
                textTransform: "none",
                fontWeight: 500,
              }}
            >
              {currentLanguage === "th" ? "หยุดพูด" : "Stop Audio"}
            </Button>
          )}

          {response && !isSpeaking && (
            <Button
              variant="outlined"
              onClick={() => speakResponse(response, currentLanguage)}
              startIcon={<Volume2 />}
              disabled={isProcessing || isRecording}
              className="rounded-full border-cyan-300 dark:border-cyan-700 text-cyan-600 dark:text-cyan-400"
              sx={{
                borderRadius: "9999px",
                textTransform: "none",
                fontWeight: 500,
              }}
            >
              {currentLanguage === "th" ? "ฟังอีกครั้ง" : "Play Audio"}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
