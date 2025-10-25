import { NextApiRequest, NextApiResponse } from 'next';
import { OpenRouterService } from '../../src/OpenRouterService';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { description, openRouterKey } = req.body;

    // Use environment variable as fallback
    const apiKey = openRouterKey || process.env.OPENROUTER_API_KEY;
    
    if (!apiKey) {
      return res.status(400).json({ error: 'OpenRouter API key is required' });
    }

    if (!description) {
      return res.status(400).json({ error: 'Description is required' });
    }

    const openRouterService = new OpenRouterService(apiKey);

    const messages = [
      {
        role: 'system',
        content: `You are an AI assistant that breaks down complex goals into specific, actionable subgoals. 

Given a main goal, provide 3-5 specific subgoals that would help accomplish it. Each subgoal should be:
- Specific and actionable
- Measurable
- Achievable
- Relevant to the main goal

Respond with a simple numbered list, one subgoal per line. Do not include any other text or formatting.

Example:
1. Research target market and competitors
2. Create detailed business plan with financial projections
3. Secure initial funding or investment
4. Develop minimum viable product
5. Launch marketing campaign`
      },
      {
        role: 'user',
        content: `Break down this goal into specific subgoals: ${description}`
      }
    ];

    const response = await openRouterService.chatCompletion(
      'deepseek/deepseek-chat-v3.1:free',
      messages,
      { temperature: 0.5, max_tokens: 500 }
    );

    const content = response.choices?.[0]?.message?.content || '';
    
    // Parse the numbered list into an array
    const subgoals = content
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0 && /^\d+\./.test(line))
      .map(line => line.replace(/^\d+\.\s*/, '').trim())
      .filter(goal => goal.length > 0);

    res.status(200).json({ subgoals });
  } catch (error) {
    console.error('Subgoals generation error:', error);
    res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Failed to generate subgoals' 
    });
  }
}