import { NextApiRequest, NextApiResponse } from 'next';

// In-memory storage for demo purposes
// In production, you'd use a database
const sessions: { [key: string]: any } = {};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    // Return list of sessions
    const sessionList = Object.keys(sessions).map(id => ({
      id,
      name: sessions[id].name,
      description: sessions[id].description,
      created: sessions[id].created || new Date().toISOString(),
      updated: sessions[id].updated || new Date().toISOString()
    }));
    
    res.status(200).json(sessionList);
  } else if (req.method === 'POST') {
    // Create new session
    const { agent } = req.body;
    
    if (!agent || !agent.id) {
      return res.status(400).json({ error: 'Agent data is required' });
    }
    
    sessions[agent.id] = {
      ...agent,
      created: new Date().toISOString(),
      updated: new Date().toISOString()
    };
    
    res.status(201).json({ success: true, id: agent.id });
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}