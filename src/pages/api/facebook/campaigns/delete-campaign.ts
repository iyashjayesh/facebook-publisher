import axios from "axios";
import type { NextApiRequest, NextApiResponse } from 'next';

interface DeleteCampaignRequest {
    accountId: string;
    accessToken: string;
    campaignId: string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const {
        accountId,
        accessToken,
        campaignId
    } = req.body as DeleteCampaignRequest;

    if (!accountId || !accessToken || !campaignId) {
        return res.status(400).json({
            error: "Account ID, Access Token, and Campaign ID are required"
        });
    }

    try {
        const endpoint = `https://graph.facebook.com/v22.0/${campaignId}`;

        console.log('Deleting campaign:', {
            campaignId
        });

        const response = await axios.delete(endpoint, {
            params: {
                access_token: accessToken
            }
        });

        return res.status(200).json({
            success: true,
            result: response.data,
            message: 'Campaign deleted successfully'
        });
    } catch (err: any) {
        console.error('Facebook Marketing API Error:', err.response?.data || err.message);
        return res.status(500).json({
            error: err.response?.data?.error?.message || err.message,
            details: err.response?.data
        });
    }
}

