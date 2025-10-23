import axios from "axios";
import type { NextApiRequest, NextApiResponse } from 'next';

interface CreateCreativeRequest {
    accountId: string;
    accessToken: string;
    name: string;
    pageId: string;
    imageUrl?: string;
    imageHash?: string;
    videoId?: string;
    title?: string;
    body?: string;
    linkUrl?: string;
    callToAction?: {
        type: string;
        value?: {
            link?: string;
        };
    };
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const {
        accountId,
        accessToken,
        name,
        pageId,
        imageUrl,
        imageHash,
        videoId,
        title,
        body,
        linkUrl,
        callToAction
    } = req.body as CreateCreativeRequest;

    if (!accountId || !accessToken || !name || !pageId) {
        return res.status(400).json({
            error: "Account ID, Access Token, Name, and Page ID are required"
        });
    }

    try {
        const endpoint = `https://graph.facebook.com/v18.0/act_${accountId}/adcreatives`;

        // Build object_story_spec
        const objectStorySpec: any = {
            page_id: pageId,
        };

        // If we have an image
        if (imageHash || imageUrl) {
            objectStorySpec.link_data = {
                message: body || '',
                link: linkUrl || '',
                name: title || '',
            };

            if (imageHash) {
                objectStorySpec.link_data.image_hash = imageHash;
            } else if (imageUrl) {
                objectStorySpec.link_data.picture = imageUrl;
            }

            if (callToAction) {
                objectStorySpec.link_data.call_to_action = callToAction;
            }
        }
        // If we have a video
        else if (videoId) {
            objectStorySpec.video_data = {
                video_id: videoId,
                message: body || '',
                title: title || '',
            };

            if (callToAction) {
                objectStorySpec.video_data.call_to_action = callToAction;
            }
        }
        // Text only
        else {
            objectStorySpec.link_data = {
                message: body || '',
                link: linkUrl || '',
                name: title || '',
            };

            if (callToAction) {
                objectStorySpec.link_data.call_to_action = callToAction;
            }
        }

        const params = {
            name,
            object_story_spec: JSON.stringify(objectStorySpec),
            access_token: accessToken
        };

        console.log('Creating ad creative with params:', {
            accountId,
            name,
            pageId
        });

        const response = await axios.post(endpoint, null, { params });

        return res.status(200).json({
            success: true,
            creative: response.data,
            message: 'Ad Creative created successfully'
        });
    } catch (err: any) {
        console.error('Facebook Marketing API Error:', err.response?.data || err.message);
        return res.status(500).json({
            error: err.response?.data?.error?.message || err.message,
            details: err.response?.data
        });
    }
}

