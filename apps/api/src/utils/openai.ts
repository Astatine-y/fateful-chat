import { OpenAI } from 'openai';
import { config } from '../config';

interface BaziResult {
  year: string;
  month: string;
  day: string;
  hour: string;
}

const openai = config.openai.apiKey ? new OpenAI({
  apiKey: config.openai.apiKey,
}) : null;

const ollamaUrl = process.env.OLLAMA_URL || 'http://localhost:11434';

async function getOllamaInterpretation(bazi: BaziResult | string): Promise<string> {
  let prompt: string;
  
  if (typeof bazi === 'string') {
    prompt = bazi;
  } else {
    prompt = `请解读以下八字（天干地支）：
年柱：${bazi.year}
月柱：${bazi.month}
日柱：${bazi.day}
时柱：${bazi.hour}

请提供详细的八字分析和人生建议，用中文回复。`;
  }

  try {
    const response = await fetch(`${ollamaUrl}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'llama3.2',
        prompt,
        stream: false,
      }),
    });

    if (!response.ok) {
      throw new Error('Ollama request failed');
    }

    const data = await response.json() as { response?: string };
    return data.response || 'Ollama返回为空';
  } catch (error) {
    console.error('Ollama error:', error);
    throw error;
  }
}

export async function getAiInterpretation(bazi: BaziResult | string): Promise<string> {
  if (!openai) {
    // Try Ollama as fallback
    try {
      return await getOllamaInterpretation(bazi);
    } catch {
      return 'AI interpretation unavailable. Both OpenAI and Ollama are not configured.';
    }
  }

  try {
    let prompt: string;
    
    if (typeof bazi === 'string') {
      prompt = `请解读以下八字（天干地支）：\n${bazi}\n\n请提供详细的八字分析和人生建议。`;
    } else {
      prompt = `请解读以下八字（天干地支）：
年柱：${bazi.year}
月柱：${bazi.month}
日柱：${bazi.day}
时柱：${bazi.hour}

请提供详细的八字分析和人生建议。`;
    }

    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 1500,
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) throw new Error('No response from OpenAI');
    return content;
  } catch (error) {
    console.error('OpenAI API error:', error);
    // Try Ollama as fallback
    try {
      return await getOllamaInterpretation(bazi);
    } catch {
      throw new Error('Failed to get AI interpretation');
    }
  }
}