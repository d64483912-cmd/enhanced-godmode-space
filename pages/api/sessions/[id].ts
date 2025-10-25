import { NextApiRequest, NextApiResponse } from 'next';

// In-memory storage for demo purposes
// In production, you'd use a database
const sessions: { [key: string]: any } = {};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;
  
  if (typeof id !== 'string') {
    return res.status(400).json({ error: 'Invalid session ID' });
  }

  if (req.method === 'GET') {
    // Get specific session
    const session = sessions[id];
    
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }
    
    res.status(200).json(session);
  } else if (req.method === 'PUT') {
    // Update session
    const { agent } = req.body;
    
    if (!agent) {
      return res.status(400).json({ error: 'Agent data is required' });
    }
    
    sessions[id] = {
      ...agent,
      updated: new Date().toISOString()
    };
    
    res.status(200).json({ success: true });
  } else if (req.method === 'DELETE') {
    // Delete session
    if (sessions[id]) {
      delete sessions[id];
      res.status(200).json({ success: true });
    } else {
      res.status(404).json({ error: 'Session not found' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}