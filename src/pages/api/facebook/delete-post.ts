import axios from "axios";
import type { NextApiRequest, NextApiResponse } from 'next';

interface DeletePostRequest {
    postId: string;
    pageToken: string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'DELETE') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { postId, pageToken } = req.body as DeletePostRequest;

    if (!postId || !pageToken) {
        return res.status(400).json({ error: "Post ID and Page Token are required" });
    }

    try {
        const response = await axios.delete(
            `https://graph.facebook.com/v18.0/${postId}`,
            {
                params: {
                    access_token: pageToken
                }
            }
        );

        return res.status(200).json({
            success: true,
            data: response.data
        });
    } catch (err) {
        console.error('Facebook API Error:', err);
        if (axios.isAxiosError(err)) {
            return res.status(500).json({
                error: err.response?.data?.error?.message || err.message,
                details: err.response?.data
            });
        }
        return res.status(500).json({
            error: 'An unexpected error occurred'
        });
    }
}

