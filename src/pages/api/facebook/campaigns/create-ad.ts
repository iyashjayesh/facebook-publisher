import axios from "axios";
import type { NextApiRequest, NextApiResponse } from 'next';

interface CreateAdRequest {
    accountId: string;
    accessToken: string;
    name: string;
    adsetId: string;
    creativeId: string;
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
        adsetId,
        creativeId,
        status = 'PAUSED'
    } = req.body as CreateAdRequest;

    if (!accountId || !accessToken || !name || !adsetId || !creativeId) {
        return res.status(400).json({
            error: "Account ID, Access Token, Name, Ad Set ID, and Creative ID are required"
        });
    }

    try {
        const endpoint = `https://graph.facebook.com/v18.0/act_${accountId}/ads`;

        const params = {
            name,
            adset_id: adsetId,
            creative: JSON.stringify({ creative_id: creativeId }),
            status,
            access_token: accessToken
        };

        console.log('Creating ad with params:', {
            accountId,
            name,
            adsetId,
            creativeId,
            status
        });

        const response = await axios.post(endpoint, null, { params });

        return res.status(200).json({
            success: true,
            ad: response.data,
            message: 'Ad created successfully'
        });
    } catch (err: any) {
        console.error('Facebook Marketing API Error:', err.response?.data || err.message);
        return res.status(500).json({
            error: err.response?.data?.error?.message || err.message,
            details: err.response?.data
        });
    }
}

