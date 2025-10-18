import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { pageId, pageToken, message } = req.body;

        // Validation
        if (!pageId || !pageToken || !message) {
            return res.status(400).json({
                error: 'Missing required fields',
                requiredFields: {
                    pageId: !!pageId,
                    pageToken: !!pageToken,
                    message: !!message,
                },
            });
        }

        console.log('Publishing text post to Facebook:', {
            pageId,
            messageLength: message.length,
            url: `https://graph.facebook.com/${pageId}/feed`
        });

        // Call Facebook Graph API to publish the post
        const response = await fetch(`https://graph.facebook.com/${pageId}/feed`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                message: message,
                access_token: pageToken,
            }),
        });

        const data = await response.json();
        console.log('Facebook API response:', data);

        if (!response.ok) {
            console.error('Facebook API error:', data);
            throw new Error(data.error?.message || 'Failed to publish post');
        }

        return res.status(200).json({
            success: true,
            postId: data.id,
            message: 'Post published successfully',
        });
    } catch (error) {
        console.error('Error publishing post:', error);
        return res.status(500).json({
            error: 'Failed to publish post',
            details: error instanceof Error ? error.message : 'Unknown error',
        });
    }
}