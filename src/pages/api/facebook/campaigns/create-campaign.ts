import axios from "axios";
import type { NextApiRequest, NextApiResponse } from 'next';

interface CreateCampaignRequest {
    accountId: string;
    accessToken: string;
    name: string;
    objective: string;
    status?: string;
    special_ad_categories?: string[];
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const {
        accountId,
        accessToken,
        name,
        objective,
        status = 'PAUSED',
        special_ad_categories = []
    } = req.body as CreateCampaignRequest;

    if (!accountId || !accessToken || !name || !objective) {
        return res.status(400).json({
            error: "Account ID, Access Token, Name, and Objective are required"
        });
    }

    try {
        const endpoint = `https://graph.facebook.com/v18.0/act_${accountId}/campaigns`;

        const params = {
            name,
            objective,
            status,
            special_ad_categories,
            access_token: accessToken
        };

        console.log('Creating campaign with params:', {
            accountId,
            name,
            objective,
            status
        });

        const response = await axios.post(endpoint, null, { params });

        return res.status(200).json({
            success: true,
            campaign: response.data,
            message: 'Campaign created successfully'
        });
    } catch (err: any) {
        console.error('Facebook Marketing API Error:', err.response?.data || err.message);
        return res.status(500).json({
            error: err.response?.data?.error?.message || err.message,
            details: err.response?.data
        });
    }
}

