import axios from "axios";
import type { NextApiRequest, NextApiResponse } from 'next';

interface FetchPostsRequest {
    pageId: string;
    pageToken: string;
    limit?: number;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { pageId, pageToken, limit = 25 } = req.body as FetchPostsRequest;

    if (!pageId || !pageToken) {
        return res.status(400).json({ error: "Page ID and Page Token are required" });
    }

    try {
        const response = await axios.get(
            `https://graph.facebook.com/v18.0/${pageId}/posts`,
            {
                params: {
                    access_token: pageToken,
                    fields: 'id,message,created_time,permalink_url,attachments{media,type,url},reactions.summary(total_count).limit(0),comments.summary(total_count).limit(0),shares',
                    limit: limit
                }
            }
        );

        return res.status(200).json({
            success: true,
            posts: response.data.data,
            paging: response.data.paging
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

