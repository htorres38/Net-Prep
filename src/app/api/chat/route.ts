import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY ?? '')

export async function POST(req: NextRequest) {
  if (!process.env.GEMINI_API_KEY) {
    return NextResponse.json({ error: 'AI feature not configured' }, { status: 503 })
  }
  try {
    const { messages } = await req.json() as {
      messages: { role: 'user' | 'assistant'; text: string }[]
    }

    if (!messages?.length) {
      return NextResponse.json({ error: 'No messages provided' }, { status: 400 })
    }

    const history = messages.slice(0, -1)
      .map(m => `${m.role === 'user' ? 'Student' : 'Tutor'}: ${m.text}`)
      .join('\n')

    const latest = messages[messages.length - 1].text

    const prompt = `You are a concise CCNA 200-301 study assistant built into PrepNet, a CCNA exam prep app. Answer networking questions clearly and accurately. Keep responses short — 2 to 3 sentences unless a longer explanation is truly needed. Plain text only, no markdown, no bullet points.

${history ? `Previous conversation:\n${history}\n\n` : ''}Student: ${latest}
Tutor:`

    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })
    const result = await model.generateContent(prompt)
    return NextResponse.json({ text: result.response.text() })
  } catch (err) {
    console.error('[/api/chat]', err)
    return NextResponse.json({ error: 'Failed to generate response' }, { status: 500 })
  }
}
