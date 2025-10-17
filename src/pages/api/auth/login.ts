import type { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
    const scopes = [
        'pages_show_list',
        'pages_read_engagement',
        'pages_manage_posts',
        'pages_manage_engagement'
    ].join(',');

    const facebookAuthURL = `https://www.facebook.com/v18.0/dialog/oauth?client_id=${process.env.NEXT_PUBLIC_FB_APP_ID}&redirect_uri=${process.env.NEXT_PUBLIC_FB_REDIRECT_URI}&scope=${scopes}&response_type=code`;
    res.redirect(facebookAuthURL);
}
