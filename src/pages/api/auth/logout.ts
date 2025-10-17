import type { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        // Clear the Facebook data cookie
        res.setHeader(
            'Set-Cookie',
            'fbData=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax'
        );

        return res.status(200).json({ 
            success: true, 
            message: 'Logged out successfully' 
        });
    } catch (err) {
        console.error('Logout error:', err);
        const errorMessage = err instanceof Error ? err.message : 'Logout failed';
        return res.status(500).json({ error: errorMessage });
    }
}

