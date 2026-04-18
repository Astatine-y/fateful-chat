import { OpenAI } from 'openai';
import { config } from '../config';

interface BaziResult {
  year: string;
  month: string;
  day: string;
  hour: string;
}


if (!config.openai.apiKey) {
  throw new Error('OPENAI_API_KEY is not configured');
}

const openai = new OpenAI({
  apiKey: config.openai.apiKey,
});

export async function getAiInterpretation(bazi: BaziResult): Promise<string> {
  try {
    const prompt = `请解读以下八字（天干地支）：
年柱：${bazi.year}
月柱：${bazi.month}
日柱：${bazi.day}
时柱：${bazi.hour}

请提供详细的八字分析和人生建议。`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 1500,
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No response from OpenAI');
    }

    return content;
  } catch (error) {
    console.error('OpenAI API error:', error);
    throw new Error('Failed to get AI interpretation');
  }
}