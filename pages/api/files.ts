import { NextApiRequest, NextApiResponse } from 'next';

// Mock file system for demo purposes
// In production, you'd integrate with actual file storage
const mockFiles = [
  'research_notes.txt',
  'business_plan.md',
  'market_analysis.pdf',
  'financial_projections.xlsx',
  'competitor_research.json'
];

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    // Return list of files
    res.status(200).json(mockFiles);
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}