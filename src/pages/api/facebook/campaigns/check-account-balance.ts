import axios from "axios";
import type { NextApiRequest, NextApiResponse } from 'next';

interface CheckAccountRequest {
    accountId: string;
    accessToken: string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { accountId, accessToken } = req.body as CheckAccountRequest;

    if (!accountId || !accessToken) {
        return res.status(400).json({
            error: "Account ID and Access Token are required"
        });
    }

    try {
        // Check account status, balance, and payment methods
        const endpoint = `https://graph.facebook.com/v22.0/act_${accountId}`;

        const response = await axios.get(endpoint, {
            params: {
                access_token: accessToken,
                fields: 'account_status,disable_reason,balance,amount_spent,spend_cap,funding_source_details,min_daily_budget'
            }
        });

        const accountData = response.data;

        // Determine if account can run ads
        const accountStatus = accountData.account_status;
        const hasPaymentMethod = accountData.funding_source_details &&
            accountData.funding_source_details.length > 0;

        let canRunAds = true;
        let warnings = [];
        let errors = [];

        // Check account status
        // 1 = Active, 2 = Disabled, 3 = Unsettled, 7 = Pending Risk Review, etc.
        if (accountStatus !== 1) {
            canRunAds = false;
            errors.push(`Account status is not active (Status code: ${accountStatus})`);

            if (accountData.disable_reason) {
                errors.push(`Reason: ${accountData.disable_reason}`);
            }
        }

        // Check payment method
        if (!hasPaymentMethod) {
            canRunAds = false;
            errors.push('No payment method added to this ad account');
        }

        // Check spending cap
        if (accountData.spend_cap) {
            const spentAmount = parseFloat(accountData.amount_spent) / 100;
            const spendCap = parseFloat(accountData.spend_cap) / 100;
            const remaining = spendCap - spentAmount;

            if (remaining <= 0) {
                canRunAds = false;
                errors.push(`Account spending limit reached ($${spendCap.toFixed(2)})`);
            } else if (remaining < 10) {
                warnings.push(`Only $${remaining.toFixed(2)} remaining in account spending limit`);
            }
        }

        // Check balance (if applicable)
        if (accountData.balance) {
            const balanceAmount = parseFloat(accountData.balance) / 100;
            if (balanceAmount < 0) {
                warnings.push(`Negative balance: $${Math.abs(balanceAmount).toFixed(2)} owed`);
            }
        }

        return res.status(200).json({
            success: true,
            canRunAds,
            accountData: {
                account_status: accountStatus,
                has_payment_method: hasPaymentMethod,
                balance: accountData.balance ? (parseFloat(accountData.balance) / 100).toFixed(2) : null,
                amount_spent: accountData.amount_spent ? (parseFloat(accountData.amount_spent) / 100).toFixed(2) : null,
                spend_cap: accountData.spend_cap ? (parseFloat(accountData.spend_cap) / 100).toFixed(2) : null,
                min_daily_budget: accountData.min_daily_budget ? (parseFloat(accountData.min_daily_budget) / 100).toFixed(2) : null,
                funding_sources: accountData.funding_source_details?.length || 0
            },
            warnings,
            errors
        });
    } catch (err: any) {
        console.error('Facebook Account Check Error:', err.response?.data || err.message);
        return res.status(500).json({
            error: err.response?.data?.error?.message || err.message,
            details: err.response?.data,
            canRunAds: false
        });
    }
}

