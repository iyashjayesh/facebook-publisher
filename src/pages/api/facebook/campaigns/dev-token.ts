import type { NextApiRequest, NextApiResponse } from 'next';


export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (process.env.NODE_ENV !== 'development') {
        return res.status(403).json({
            error: 'This endpoint is only available in development mode',
            production: true
        });
    }

    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const systemToken = process.env.FB_SYSTEM_USER_TOKEN;

    if (!systemToken) {
        return res.status(404).json({
            error: "System user token not configured",
            help: "See SYSTEM_USER_SETUP.md for instructions on how to create and configure a system user token",
            available: false
        });
    }

    return res.status(200).json({
        success: true,
        token: systemToken,
        isDevelopment: true,
        message: "Using system user token for development. This will not work in production."
    });
}

