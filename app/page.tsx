import { Container, Typography } from "@mui/material"
import ChatTabs from "@/components/chat-tabs"

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-4">
      <Container maxWidth="md" className="py-8">
        <div className="flex flex-col items-center justify-center mb-10">
          <Typography
            variant="h3"
            component="h1"
            className="text-center font-bold mb-3 bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent"
          >
            Foot Pressure Medical Advisor
          </Typography>
          <Typography variant="subtitle1" className="text-center text-slate-600 dark:text-slate-300 max-w-md mx-auto">
            Get expert advice on foot pressure issues in Thai and English
          </Typography>
        </div>

        <ChatTabs />
      </Container>
    </main>
  )
}
