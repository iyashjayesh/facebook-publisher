import axios from "axios";
import type { NextApiRequest, NextApiResponse } from 'next';

interface UpdateCampaignRequest {
    accountId: string;
    accessToken: string;
    campaignId: string;
    name?: string;
    status?: string;
    objective?: string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const {
        accountId,
        accessToken,
        campaignId,
        name,
        status,
        objective
    } = req.body as UpdateCampaignRequest;

    if (!accountId || !accessToken || !campaignId) {
        return res.status(400).json({
            error: "Account ID, Access Token, and Campaign ID are required"
        });
    }

    try {
        const endpoint = `https://graph.facebook.com/v22.0/${campaignId}`;

        const updateParams: any = {
            access_token: accessToken
        };

        if (name) updateParams.name = name;
        if (status) updateParams.status = status;
        if (objective) updateParams.objective = objective;

        console.log('Updating campaign:', {
            campaignId,
            updates: updateParams
        });

        const formData = new URLSearchParams(updateParams);

        const response = await axios.post(endpoint, formData, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });

        return res.status(200).json({
            success: true,
            campaign: response.data,
            message: 'Campaign updated successfully'
        });
    } catch (err: any) {
        console.error('Facebook Marketing API Error:', err.response?.data || err.message);
        return res.status(500).json({
            error: err.response?.data?.error?.message || err.message,
            details: err.response?.data
        });
    }
}

