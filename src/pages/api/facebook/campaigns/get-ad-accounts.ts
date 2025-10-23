import axios from "axios";
import type { NextApiRequest, NextApiResponse } from 'next';

interface GetAdAccountsRequest {
    accessToken: string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { accessToken } = req.body as GetAdAccountsRequest;

    if (!accessToken) {
        return res.status(400).json({
            error: "Access Token is required"
        });
    }

    try {
        const endpoint = `https://graph.facebook.com/v22.0/me/adaccounts`;

        const params = {
            fields: 'id,name,account_id,account_status,currency,timezone_name',
            access_token: accessToken
        };

        console.log('Fetching ad accounts...');

        const response = await axios.get(endpoint, { params });

        return res.status(200).json({
            success: true,
            adAccounts: response.data.data
        });
    } catch (err: any) {
        console.error('Facebook Marketing API Error:', err.response?.data || err.message);
        return res.status(500).json({
            error: err.response?.data?.error?.message || err.message,
            details: err.response?.data
        });
    }
}

