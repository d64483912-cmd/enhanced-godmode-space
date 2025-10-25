import { NextApiRequest, NextApiResponse } from 'next';
import { OpenRouterService } from '../../src/OpenRouterService';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { name, description, goals, openRouterKey } = req.body;

    // Use environment variable as fallback
    const apiKey = openRouterKey || process.env.OPENROUTER_API_KEY;
    
    if (!apiKey) {
      return res.status(400).json({ error: 'OpenRouter API key is required' });
    }

    if (!description) {
      return res.status(400).json({ error: 'Description is required' });
    }

    const openRouterService = new OpenRouterService(apiKey);

    // Create the agent with initial task
    const agentId = `agent_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Use OpenRouter to generate the first response
    const messages = [
      {
        role: 'system',
        content: `You are an AI agent named "${name || 'GodGPT'}". Your task is to help accomplish the following goal: ${description}

You should respond with a JSON object containing:
- thoughts: Your reasoning about the task
- plan: A step-by-step plan to accomplish the goal
- command: The next action to take
- args: Arguments for the command
- speak: A brief summary for the user

Available commands: web_search, write_file, read_file, execute_code, analyze_data, research_topic

Be helpful and provide actionable steps.`
      },
      {
        role: 'user',
        content: `Please help me with: ${description}`
      }
    ];

    const response = await openRouterService.chatCompletion(
      'deepseek/deepseek-chat-v3.1:free',
      messages,
      { temperature: 0.7, max_tokens: 1000 }
    );

    const assistantReply = response.choices?.[0]?.message?.content || '';

    // Try to parse structured response, fallback to simple format
    let thoughts = null;
    let command = 'research_topic';
    let args = description;

    try {
      const parsed = JSON.parse(assistantReply);
      thoughts = {
        thoughts: parsed.thoughts || assistantReply,
        reasoning: parsed.reasoning || 'Analyzing the task requirements',
        plan: parsed.plan || 'Step-by-step approach to accomplish the goal',
        criticism: parsed.criticism || 'Ensuring thorough analysis',
        speak: parsed.speak || 'Working on your request',
        relevant_goal: description
      };
      command = parsed.command || command;
      args = parsed.args || args;
    } catch (e) {
      // Use fallback structure
      thoughts = {
        thoughts: assistantReply,
        reasoning: 'Analyzing the task requirements',
        plan: 'Breaking down the task into manageable steps',
        criticism: 'Ensuring comprehensive approach',
        speak: 'Starting to work on your request',
        relevant_goal: description
      };
    }

    const agent = {
      id: agentId,
      name: name || 'GodGPT',
      description,
      goals: goals || [description],
      command,
      args,
      assistantReply,
      thoughts,
      output: [
        { role: 'user', content: description },
        { role: 'assistant', content: assistantReply }
      ],
      tasks: []
    };

    res.status(200).json(agent);
  } catch (error) {
    console.error('Agent creation error:', error);
    res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Failed to create agent' 
    });
  }
}