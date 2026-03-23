import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY ?? '')

export async function POST(req: NextRequest) {
  if (!process.env.GEMINI_API_KEY) {
    return NextResponse.json({ error: 'AI feature not configured' }, { status: 503 })
  }
  try {
    const { question, options, userAnswer, correctAnswer, existingExplanation, context } =
      await req.json()

    if (!question || !correctAnswer) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const optionsList = Array.isArray(options)
      ? options.map((opt: string, i: number) => `  ${String.fromCharCode(65 + i)}. ${opt}`).join('\n')
      : ''

    const prompt = `You are a concise CCNA study coach helping a student who answered a quiz question incorrectly.

Context: ${context ?? 'quiz'}
Question: ${question}
Answer choices:
${optionsList}
Student selected: "${userAnswer}"
Correct answer: "${correctAnswer}"
Existing explanation: ${existingExplanation}

Respond with exactly 3 short paragraphs — no headers, no bullet points, no markdown:

Paragraph 1: In 1–2 sentences, explain specifically why "${userAnswer}" is incorrect.
Paragraph 2: In 1–2 sentences, explain why "${correctAnswer}" is the right answer.
Paragraph 3: One "review tip" — name the specific CCNA concept or topic the student should revisit next.

Keep it beginner-friendly, technically accurate, and under 120 words total. Do not repeat the existing explanation word-for-word.`

    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })
    const result = await model.generateContent(prompt)
    const text = result.response.text()

    return NextResponse.json({ explanation: text })
  } catch (err) {
    console.error('[/api/explain]', err)
    return NextResponse.json(
      { error: 'Failed to generate explanation' },
      { status: 500 }
    )
  }
}
