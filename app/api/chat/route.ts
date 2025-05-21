import { GoogleGenerativeAI } from "@google/generative-ai"

export async function POST(req: Request) {
  try {
    const { messages, language = "en" } = await req.json()

    // Get API key from environment variable
    const apiKey = process.env.GEMINI_API_KEY

    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not set in environment variables")
    }

    // Initialize Gemini API with the API key
    const genAI = new GoogleGenerativeAI(apiKey)

    // Create system prompt based on language with formatting instructions
    const systemPrompt =
      language === "th"
        ? `คุณเป็นผู้เชี่ยวชาญทางการแพทย์ด้านแรงกดฝ่าเท้า ให้คำแนะนำทางการแพทย์เกี่ยวกับปัญหาแรงกดฝ่าเท้าเป็นภาษาไทย ใช้คำศัพท์ทางการแพทย์ที่ถูกต้องแต่อธิบายให้เข้าใจง่าย

ใช้การจัดรูปแบบ Markdown เพื่อให้คำตอบอ่านง่าย:
- ใช้หัวข้อ (# ## ###) สำหรับหัวข้อหลักและหัวข้อย่อย
- ใช้ตัวหนา (**ข้อความ**) สำหรับคำศัพท์ทางการแพทย์หรือคำสำคัญ
- ใช้รายการแบบมีหัวข้อย่อย (- หรือ *) สำหรับรายการ
- แบ่งเนื้อหาเป็นย่อหน้าสั้นๆ เพื่อให้อ่านง่าย`
        : `You are a medical expert specializing in foot pressure issues. Provide medical advice about foot pressure problems in English. Use proper medical terminology but explain in an accessible way.

Use Markdown formatting to make your responses easy to read:
- Use headings (# ## ###) for main topics and subtopics
- Use bold (**text**) for medical terms or key points
- Use bullet points (- or *) for lists
- Break content into short paragraphs for readability`

    // Find the last user message
    const lastUserMessage = [...messages].reverse().find((msg) => msg.role === "user")

    if (!lastUserMessage) {
      throw new Error("No user message found")
    }

    // Use the gemini-1.5-flash model which might have fewer restrictions
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      generationConfig: {
        temperature: 0.4,
        topP: 0.8,
        topK: 40,
      },
    })

    // Format the content for the API
    const prompt = [{ text: systemPrompt }, { text: lastUserMessage.content }]

    // Generate content
    const result = await model.generateContent({
      contents: [{ role: "user", parts: prompt }],
    })

    const response = result.response.text()

    return new Response(JSON.stringify({ response }), {
      headers: { "Content-Type": "application/json" },
    })
  } catch (error) {
    console.error("Error in chat API:", error)
    return new Response(
      JSON.stringify({
        error: "Failed to process request",
        details: error instanceof Error ? error.message : String(error),
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    )
  }
}
