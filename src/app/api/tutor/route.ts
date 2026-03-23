import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY ?? '')

export async function POST(req: NextRequest) {
  if (!process.env.GEMINI_API_KEY) {
    return NextResponse.json({ error: 'AI feature not configured' }, { status: 503 })
  }
  try {
    const { lessonTitle, slideTitle, slideContent, question } = await req.json()

    if (!lessonTitle || !slideTitle) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const prompt = `You are a friendly, concise CCNA study tutor. A student is studying the lesson "${lessonTitle}" and is viewing a slide titled "${slideTitle}".

Slide content:
${slideContent ?? ''}

${question?.trim()
  ? `The student asks: "${question.trim()}"\n\nAnswer their question directly using the slide context above.`
  : 'Give a plain-English explanation of the key concept on this slide.'
}

Respond in 2–3 short paragraphs. No bullet points, no markdown headers, no bold text. Be clear, technically accurate, and beginner-friendly. Keep it under 130 words total.`

    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })
    const result = await model.generateContent(prompt)
    const text = result.response.text()

    return NextResponse.json({ explanation: text })
  } catch (err) {
    console.error('[/api/tutor]', err)
    return NextResponse.json({ error: 'Failed to generate explanation' }, { status: 500 })
  }
}
