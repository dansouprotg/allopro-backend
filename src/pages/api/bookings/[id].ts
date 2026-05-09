import { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;
  
  if (req.method === 'GET') {
    res.status(200).json({ message: `Get booking ${id} endpoint` });
  } else if (req.method === 'PUT') {
    res.status(200).json({ message: `Update booking ${id} endpoint` });
  } else if (req.method === 'DELETE') {
    res.status(200).json({ message: `Delete booking ${id} endpoint` });
  } else {
    res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}