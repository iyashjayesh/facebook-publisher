import type { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
    // Base permissions that work without App Review
    const scopes = [
        'pages_show_list',
        'pages_read_engagement',
        'pages_manage_posts',
        'pages_manage_engagement',
        'ads_management',
        'ads_read',
        'business_management',
    ];

    // Ad permissions - only add if explicitly requested via query param
    // For development, use system user token instead (see SYSTEM_USER_SETUP.md)
    // const requestAdsPermissions = req.query.include_ads === 'true';

    // if (requestAdsPermissions) {
    //     // Only request these if Marketing API ˜is properly set up
    //     baseScopes.push('ads_management');
    //     baseScopes.push('ads_read');
    //     baseScopes.push('business_management');
    // }

    // const scopes = baseScopes.join(',');

    const facebookAuthURL = `https://www.facebook.com/v18.0/dialog/oauth?client_id=${process.env.NEXT_PUBLIC_FB_APP_ID}&redirect_uri=${process.env.NEXT_PUBLIC_FB_REDIRECT_URI}&scope=${scopes.join(',')}&response_type=code`;
    res.redirect(facebookAuthURL);
}
