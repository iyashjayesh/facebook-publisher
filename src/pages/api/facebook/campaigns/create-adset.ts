import axios from "axios";
import type { NextApiRequest, NextApiResponse } from 'next';

interface CreateAdSetRequest {
    accountId: string;
    accessToken: string;
    campaignId: string;
    name: string;
    dailyBudget?: number;
    lifetimeBudget?: number;
    billingEvent: string;
    optimizationGoal: string;
    bidAmount?: number;
    startTime?: string;
    endTime?: string;
    targeting: {
        geo_locations?: {
            countries?: string[];
            cities?: Array<{ key: string }>;
            regions?: Array<{ key: string }>;
        };
        age_min?: number;
        age_max?: number;
        genders?: number[];
        interests?: Array<{ id: string; name: string }>;
    };
    status?: string;
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
        dailyBudget,
        lifetimeBudget,
        billingEvent,
        optimizationGoal,
        bidAmount,
        startTime,
        endTime,
        targeting,
        status = 'PAUSED'
    } = req.body as CreateAdSetRequest;

    if (!accountId || !accessToken || !campaignId || !name || !billingEvent || !optimizationGoal) {
        return res.status(400).json({
            error: "Account ID, Access Token, Campaign ID, Name, Billing Event, and Optimization Goal are required"
        });
    }

    if (!dailyBudget && !lifetimeBudget) {
        return res.status(400).json({
            error: "Either daily budget or lifetime budget must be specified"
        });
    }

    try {
        const endpoint = `https://graph.facebook.com/v22.0/act_${accountId}/adsets`;

        // Basic ad set creation as per Facebook documentation
        // https://developers.facebook.com/docs/marketing-api/get-started/basic-ad-creation
        const formParams: any = {
            name,
            campaign_id: campaignId,
            billing_event: billingEvent,
            optimization_goal: optimizationGoal,
            bid_strategy: 'LOWEST_COST_WITHOUT_CAP', // Required for budget optimization
            status,
            targeting: JSON.stringify(targeting),
            promoted_object: JSON.stringify({}), // Required for some objectives
            access_token: accessToken
        };

        // Budget must be in cents
        if (dailyBudget) {
            formParams.daily_budget = Math.round(dailyBudget * 100).toString();
        }
        if (lifetimeBudget) {
            formParams.lifetime_budget = Math.round(lifetimeBudget * 100).toString();
        }

        if (bidAmount) {
            formParams.bid_amount = Math.round(bidAmount * 100).toString();
        }

        if (startTime) {
            formParams.start_time = startTime;
        }

        if (endTime) {
            formParams.end_time = endTime;
        }

        console.log('Creating ad set:', {
            accountId,
            campaignId,
            name,
            dailyBudget: dailyBudget ? `$${dailyBudget}` : undefined,
            lifetimeBudget: lifetimeBudget ? `$${lifetimeBudget}` : undefined
        });

        const formData = new URLSearchParams(formParams);

        const response = await axios.post(endpoint, formData, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });

        return res.status(200).json({
            success: true,
            adset: response.data,
            message: 'Ad Set created successfully'
        });
    } catch (err: any) {
        console.error('Facebook Marketing API Error:', err.response?.data || err.message);
        return res.status(500).json({
            error: err.response?.data?.error?.message || err.message,
            details: err.response?.data
        });
    }
}

