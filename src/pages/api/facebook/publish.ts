import axios from "axios";
import type { NextApiRequest, NextApiResponse } from 'next';

interface PublishRequest {
    pageId: string;
    pageToken: string;
    message?: string;
    mediaUrl?: string;
    type?: 'photo' | 'video';
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { pageId, pageToken, message, mediaUrl, type } = req.body as PublishRequest;

    if (!pageId || !pageToken) {
        return res.status(400).json({ error: "Page ID and Page Token are required" });
    }

    try {
        if (!mediaUrl) {
            const textEndpoint = `https://graph.facebook.com/v18.0/${pageId}/feed`;
            const textParams = {
                message: message,
                access_token: pageToken
            };

            const publishRes = await axios.post(textEndpoint, null, { params: textParams });
            return res.status(200).json(publishRes.data);
        }

        const endpoint = `https://graph.facebook.com/v18.0/${pageId}/${type === "video" ? "videos" : "photos"}`;

        const params = type === "video"
            ? {
                file_url: mediaUrl,
                description: message,
                access_token: pageToken
            }
            : {
                url: mediaUrl,
                caption: message,
                access_token: pageToken
            };

        console.log('Publishing to Facebook with params:', {
            endpoint,
            pageId,
            messageLength: message?.length,
            hasMediaUrl: !!mediaUrl,
            type
        });

        const publishRes = await axios.post(endpoint, null, { params });
        return res.status(200).json({
            success: true,
            data: publishRes.data,
            postType: type,
            mediaIncluded: !!mediaUrl
        });
    } catch (err) {
        console.error('Facebook API Error:', err.response?.data || err.message);
        return res.status(500).json({
            error: err.response?.data?.error?.message || err.message,
            details: err.response?.data
        });
    }
}
