import axios from "axios";
import type { NextApiRequest, NextApiResponse } from 'next';

interface ListCampaignsRequest {
    accountId: string;
    accessToken: string;
    limit?: number;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const {
        accountId,
        accessToken,
        limit = 25
    } = req.body as ListCampaignsRequest;

    if (!accountId || !accessToken) {
        return res.status(400).json({
            error: "Account ID and Access Token are required"
        });
    }

    try {
        const endpoint = `https://graph.facebook.com/v18.0/act_${accountId}/campaigns`;

        const params = {
            fields: 'id,name,objective,status,created_time,updated_time,daily_budget,lifetime_budget,insights{spend,impressions,clicks,ctr,cpc,cpm}',
            limit,
            access_token: accessToken
        };

        console.log('Fetching campaigns for account:', accountId);

        const response = await axios.get(endpoint, { params });

        return res.status(200).json({
            success: true,
            campaigns: response.data.data,
            paging: response.data.paging
        });
    } catch (err: any) {
        console.error('Facebook Marketing API Error:', err.response?.data || err.message);
        return res.status(500).json({
            error: err.response?.data?.error?.message || err.message,
            details: err.response?.data
        });
    }
}

