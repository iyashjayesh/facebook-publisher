import axios from "axios";
import type { NextApiRequest, NextApiResponse } from 'next';

interface FacebookPage {
    id: string;
    name: string;
    access_token: string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { code } = req.query;

    if (!code) {
        return res.redirect('/');
    }

    try {
        const tokenRes = await axios.get(
            `https://graph.facebook.com/v18.0/oauth/access_token`, {
            params: {
                client_id: process.env.NEXT_PUBLIC_FB_APP_ID,
                redirect_uri: process.env.NEXT_PUBLIC_FB_REDIRECT_URI,
                client_secret: process.env.FB_APP_SECRET,
                code,
            },
        });

        const userToken = tokenRes.data.access_token;

        const pagesRes = await axios.get(`https://graph.facebook.com/me/accounts`, {
            params: { access_token: userToken },
        });

        const responseData = {
            userToken,
            pages: pagesRes.data.data,
        };

        const base64Data = Buffer.from(JSON.stringify(responseData)).toString('base64');
        res.setHeader(
            'Set-Cookie',
            `fbData=${base64Data}; Path=/; SameSite=Lax; Max-Age=86400`
        );

        return res.redirect('/');
    } catch (err) {
        console.error('Facebook auth error:', err);
        const errorMessage = err instanceof Error ? err.message : 'Authentication failed';
        return res.status(500).json({ error: errorMessage });
    }
}
