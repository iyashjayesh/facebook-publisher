import axios from "axios";
import type { NextApiRequest, NextApiResponse } from 'next';

interface CreateCampaignRequest {
    accountId: string;
    accessToken: string;
    name: string;
    objective: string;
    status?: string;
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
        status = 'PAUSED'
    } = req.body as CreateCampaignRequest;

    if (!accountId || !accessToken || !name || !objective) {
        return res.status(400).json({
            error: "Account ID, Access Token, Name, and Objective are required"
        });
    }

    try {
        const endpoint = `https://graph.facebook.com/v22.0/act_${accountId}/campaigns`;

        // Basic ad creation as per Facebook documentation
        // https://developers.facebook.com/docs/marketing-api/get-started/basic-ad-creation
        const formData = new URLSearchParams({
            name,
            objective,
            status,
            special_ad_categories: '[]', // Empty array for standard ads
            is_adset_budget_sharing_enabled: 'false', // Disable budget sharing across ad sets
            access_token: accessToken
        });

        console.log('Creating campaign:', {
            accountId,
            name,
            objective,
            status
        });

        const response = await axios.post(endpoint, formData, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });

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

