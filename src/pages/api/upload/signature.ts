import { NextApiRequest, NextApiResponse } from 'next';
import cloudinary from '../../../utils/cloudinary';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const timestamp = Math.round(new Date().getTime() / 1000);
    const signature = cloudinary.utils.api_sign_request(
      {
        timestamp,
        folder: 'allopro/services',
      },
      process.env.CLOUDINARY_API_SECRET!
    );

    res.status(200).json({
      signature,
      timestamp,
      cloudName: process.env.CLOUDINARY_CLOUD_NAME,
      apiKey: process.env.CLOUDINARY_API_KEY,
      folder: 'allopro/services',
    });
  } catch (error) {
    console.error('Signature error:', error);
    res.status(500).json({ message: 'Failed to generate signature' });
  }
}
