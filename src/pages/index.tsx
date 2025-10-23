import { useCopilotAction, useCopilotReadable } from "@copilotkit/react-core";
import { CopilotSidebar } from "@copilotkit/react-ui";
import "@copilotkit/react-ui/styles.css";
import axios, { AxiosError } from "axios";
import { FC, useCallback, useEffect, useState } from "react";

// HITL Confirmation Dialog Component
interface PublishConfirmDialogProps {
  message: string;
  pageName: string;
  pageId: string;
  pageToken: string;
  onComplete: (result: { success: boolean; result?: unknown; error?: string; cancelled?: boolean }) => void;
}

const PublishConfirmDialog: FC<PublishConfirmDialogProps> = ({
  message,
  pageName,
  pageId,
  pageToken,
  onComplete
}) => {
  const [step, setStep] = useState<'confirm' | 'publishing' | 'done' | 'error'>('confirm');
  const [errorMsg, setErrorMsg] = useState<string>('');

  const handleConfirm = async () => {
    try {
      setStep('publishing');

      const response = await fetch("/api/copilotkit/actions/publish-text", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pageId, pageToken, message }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to publish post");
      }

      const result = await response.json();
      setStep('done');
      setTimeout(() => onComplete({ success: true, result }), 1500);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setErrorMsg(errorMessage);
      setStep('error');
      setTimeout(() => onComplete({ success: false, error: errorMessage }), 2000);
    }
  };

  const handleCancel = () => {
    onComplete({ success: false, cancelled: true });
  };

  return (
    <div style={{
      padding: '24px',
      backgroundColor: '#ffffff',
      borderRadius: '12px',
      boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)',
      maxWidth: '500px',
      minWidth: '400px',
      border: '1px solid #e5e7eb'
    }}>
      {step === 'confirm' && (
        <>
          <h3 style={{
            margin: '0 0 16px 0',
            fontSize: '18px',
            fontWeight: 600,
            color: '#000000'
          }}>
            📝 Confirm Post Publication
          </h3>
          <div style={{
            backgroundColor: '#f9fafb',
            padding: '16px',
            borderRadius: '8px',
            marginBottom: '16px',
            border: '1px solid #e5e7eb'
          }}>
            <p style={{
              margin: 0,
              whiteSpace: 'pre-wrap',
              lineHeight: '1.5',
              color: '#000000',
              fontSize: '14px'
            }}>
              {message}
            </p>
          </div>
          <p style={{
            fontSize: '14px',
            color: '#000000',
            marginBottom: '20px',
            margin: '0 0 20px 0'
          }}>
            Publishing to: <strong style={{ color: '#000000' }}>{pageName}</strong>
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
            <button
              onClick={handleCancel}
              style={{
                padding: '10px 24px',
                backgroundColor: '#f3f4f6',
                color: '#374151',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: 500,
                fontSize: '14px',
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#e5e7eb';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#f3f4f6';
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              style={{
                padding: '10px 24px',
                backgroundColor: '#6366f1',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: 500,
                fontSize: '14px',
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#4f46e5';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#6366f1';
              }}
            >
              🚀 Publish Now
            </button>
          </div>
        </>
      )}

      {step === 'publishing' && (
        <div style={{ textAlign: 'center', padding: '20px 0' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>⏳</div>
          <p style={{ margin: 0, color: '#000000', fontSize: '16px' }}>Publishing your post...</p>
        </div>
      )}

      {step === 'done' && (
        <div style={{ textAlign: 'center', padding: '20px 0' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>✅</div>
          <p style={{ margin: 0, color: '#000000', fontWeight: 600, fontSize: '16px' }}>
            Post Published Successfully!
          </p>
        </div>
      )}

      {step === 'error' && (
        <div style={{ textAlign: 'center', padding: '20px 0' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>❌</div>
          <p style={{ margin: 0, color: '#000000', fontWeight: 600, fontSize: '16px', marginBottom: '8px' }}>
            Error: {errorMsg}
          </p>
        </div>
      )}
    </div>
  );
};

interface FacebookPage {
  id: string;
  name: string;
  access_token: string;
}

interface FacebookPage {
  id: string;
  name: string;
  access_token: string;
}

interface FacebookPost {
  id: string;
  message?: string;
  created_time: string;
  permalink_url: string;
  attachments?: {
    data: Array<{
      media?: {
        image?: {
          src: string;
        };
      };
      type: string;
      url?: string;
    }>;
  };
  reactions?: {
    summary: {
      total_count: number;
    };
  };
  comments?: {
    summary: {
      total_count: number;
    };
  };
  shares?: {
    count: number;
  };
}

interface AdAccount {
  id: string;
  name: string;
  account_id: string;
  account_status: number;
  currency: string;
}

interface Campaign {
  id: string;
  name: string;
  objective: string;
  status: string;
  created_time: string;
  updated_time: string;
}

export default function Home() {
  const [pages, setPages] = useState<FacebookPage[]>([]);
  const [selectedPage, setSelectedPage] = useState<FacebookPage | null>(null);
  const [pageToken, setPageToken] = useState("");
  const [pageId, setPageId] = useState("");
  const [userToken, setUserToken] = useState("");
  const [message, setMessage] = useState("");
  const [mediaUrl, setMediaUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [posts, setPosts] = useState<FacebookPost[]>([]);
  const [deletingPostId, setDeletingPostId] = useState<string | null>(null);

  // Ad Campaign States
  const [activeTab, setActiveTab] = useState<'posts' | 'campaigns'>('posts');
  const [adAccounts, setAdAccounts] = useState<AdAccount[]>([]);
  const [selectedAdAccount, setSelectedAdAccount] = useState<AdAccount | null>(null);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [showCampaignWizard, setShowCampaignWizard] = useState(false);
  const [wizardStep, setWizardStep] = useState<1 | 2 | 3 | 4>(1);

  // Campaign Creation States
  const [campaignData, setCampaignData] = useState({
    name: '',
    objective: 'OUTCOME_TRAFFIC',
    status: 'PAUSED'
  });
  const [createdCampaignId, setCreatedCampaignId] = useState('');

  // Ad Set States
  const [adSetData, setAdSetData] = useState({
    name: '',
    dailyBudget: 10,
    billingEvent: 'IMPRESSIONS',
    optimizationGoal: 'REACH', // Changed to REACH which works with all objectives
    targeting: {
      geo_locations: { countries: ['US'] },
      age_min: 18,
      age_max: 65
    },
    status: 'PAUSED'
  });
  const [createdAdSetId, setCreatedAdSetId] = useState('');

  // Creative States
  const [creativeData, setCreativeData] = useState({
    name: '',
    title: '',
    body: '',
    linkUrl: '',
    imageUrl: '',
    callToActionType: 'LEARN_MORE'
  });
  const [createdCreativeId, setCreatedCreativeId] = useState('');

  // Final Ad State
  const [adData, setAdData] = useState({
    name: '',
    status: 'PAUSED'
  });

  // Make the Facebook page context readable by the agent
  useCopilotReadable({
    description: "The currently selected Facebook page information",
    value: {
      selectedPageName: selectedPage?.name || "",
      selectedPageId: selectedPage?.id || "",
      pageToken: selectedPage?.access_token || "",
      numberOfPosts: posts.length,
    },
  });

  // Register the publishTextPost action with HITL confirmation
  useCopilotAction({
    name: "publishTextPost",
    description: "Publish a text-only post to Facebook. This action requires user confirmation before publishing.",
    parameters: [
      {
        name: "pageId",
        type: "string",
        description: "The ID of the Facebook page to post to",
        required: true,
      },
      {
        name: "pageToken",
        type: "string",
        description: "The access token for the Facebook page",
        required: true,
      },
      {
        name: "message",
        type: "string",
        description: "The text content to post on Facebook",
        required: true,
      },
    ],
    renderAndWait: ({ args, handler }) => (
      <PublishConfirmDialog
        message={args.message}
        pageName={selectedPage?.name || 'your page'}
        pageId={args.pageId}
        pageToken={args.pageToken}
        onComplete={handler}
      />
    ),
  });

  const handlePageSelect = useCallback((page: FacebookPage | null) => {
    if (!page) return;
    setSelectedPage(page);
    setPageToken(page.access_token);
    setPageId(page.id);
  }, []);

  useEffect(() => {
    // Try to load Facebook data from cookie
    const loadFacebookData = () => {
      const cookies = document.cookie.split(';');
      const fbCookie = cookies.find(c => c.trim().startsWith('fbData='));

      if (fbCookie) {
        try {
          // Use atob for browser-compatible base64 decoding
          const base64Data = fbCookie.split('=')[1];
          const decodedData = atob(base64Data);
          const fbData = JSON.parse(decodedData);
          if (fbData.pages && fbData.pages.length > 0) {
            setPages(fbData.pages);
            // Store the user token for ad account access
            if (fbData.userToken) {
              setUserToken(fbData.userToken);
            }
            // Automatically select the first page
            handlePageSelect(fbData.pages[0]);
          }
        } catch (err) {
          console.error('Error parsing Facebook data:', err);
          setError('Error loading Facebook data. Please try logging in again.');
        }
      }
    };

    loadFacebookData();
  }, [handlePageSelect]);

  const loginWithFacebook = () => {
    setLoading(true);
    window.location.href = "/api/auth/login";
  };

  const logout = async () => {
    try {
      setLoading(true);
      await axios.post("/api/auth/logout");
      // Clear state
      setPages([]);
      setSelectedPage(null);
      setPageToken("");
      setPageId("");
      setUserToken("");
      setMessage("");
      setMediaUrl("");
      setError("");
      setAdAccounts([]);
      setSelectedAdAccount(null);
      setCampaigns([]);
    } catch (err) {
      const errorMessage = err instanceof AxiosError
        ? err.response?.data?.error || err.message
        : "An unknown error occurred";
      setError("Failed to logout: " + errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const publishPost = async () => {
    if (!pageId || !pageToken) {
      setError("Please select a page first");
      return;
    }

    if (!message && !mediaUrl) {
      setError("Please add a message or media URL");
      return;
    }

    try {
      setLoading(true);
      setError("");
      await axios.post("/api/facebook/publish", {
        pageId,
        pageToken,
        message,
        mediaUrl,
        type: "photo",
      });
      alert("Post Published Successfully!");
      // Clear form
      setMessage("");
      setMediaUrl("");
    } catch (err) {
      const errorMessage = err instanceof AxiosError
        ? err.response?.data?.error || err.message
        : "An unknown error occurred";
      setError("Failed to publish post: " + errorMessage);
    } finally {
      setLoading(false);
    }
  };


  const fetchPosts = useCallback(async () => {
    if (!selectedPage) return;

    try {
      setLoading(true);
      setError("");
      const response = await axios.post("/api/facebook/posts", {
        pageId: selectedPage.id,
        pageToken: selectedPage.access_token,
        limit: 25,
      });

      if (response.data.success) {
        setPosts(response.data.posts);
      }
    } catch (err) {
      const errorMessage = err instanceof AxiosError
        ? err.response?.data?.error || err.message
        : "An unknown error occurred";
      setError("Failed to fetch posts: " + errorMessage);
    } finally {
      setLoading(false);
    }
  }, [selectedPage]);

  useEffect(() => {
    if (selectedPage) {
      fetchPosts();
    }
  }, [selectedPage, fetchPosts]);

  const deletePost = async (postId: string) => {
    if (!selectedPage) return;

    if (!confirm("Are you sure you want to delete this post? This action cannot be undone.")) {
      return;
    }

    try {
      setDeletingPostId(postId);
      setError("");
      await axios.delete("/api/facebook/delete-post", {
        data: {
          postId,
          pageToken: selectedPage.access_token,
        },
      });

      // Remove the post from the list
      setPosts(posts.filter(post => post.id !== postId));
      alert("Post deleted successfully!");
    } catch (err) {
      const errorMessage = err instanceof AxiosError
        ? err.response?.data?.error || err.message
        : "An unknown error occurred";
      setError("Failed to delete post: " + errorMessage);
    } finally {
      setDeletingPostId(null);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  // Fetch Ad Accounts
  const fetchAdAccounts = useCallback(async () => {
    let tokenToUse = userToken;

    // In development, try to use system user token if user token not available
    if (!tokenToUse && process.env.NODE_ENV === 'development') {
      try {
        const devTokenResponse = await axios.get("/api/facebook/campaigns/dev-token");
        if (devTokenResponse.data.success) {
          tokenToUse = devTokenResponse.data.token;
          console.log("ℹ️ Using system user token for development");
        }
      } catch {
        console.log("ℹ️ System user token not configured. See SYSTEM_USER_SETUP.md");
      }
    }

    if (!tokenToUse) {
      setError("Please log in to access ad accounts. For development, see SYSTEM_USER_SETUP.md to configure system user token.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      const response = await axios.post("/api/facebook/campaigns/get-ad-accounts", {
        accessToken: tokenToUse,
      });

      if (response.data.success) {
        setAdAccounts(response.data.adAccounts);
        if (response.data.adAccounts.length > 0) {
          setSelectedAdAccount(response.data.adAccounts[0]);
        }
      }
    } catch (err) {
      const errorMessage = err instanceof AxiosError
        ? err.response?.data?.error || err.message
        : "An unknown error occurred";

      setError("Failed to fetch ad accounts: " + errorMessage);
    } finally {
      setLoading(false);
    }
  }, [userToken]);

  // Fetch Campaigns
  const fetchCampaigns = useCallback(async () => {
    if (!selectedAdAccount || !userToken) return;

    try {
      setLoading(true);
      setError("");
      const response = await axios.post("/api/facebook/campaigns/list-campaigns", {
        accountId: selectedAdAccount.account_id,
        accessToken: userToken, // Use user token for ad account operations
        limit: 25,
      });

      if (response.data.success) {
        setCampaigns(response.data.campaigns);
      }
    } catch (err) {
      const errorMessage = err instanceof AxiosError
        ? err.response?.data?.error || err.message
        : "An unknown error occurred";
      setError("Failed to fetch campaigns: " + errorMessage);
    } finally {
      setLoading(false);
    }
  }, [selectedAdAccount, userToken]);

  // Load ad accounts when switching to campaigns tab
  useEffect(() => {
    if (activeTab === 'campaigns' && userToken && adAccounts.length === 0) {
      fetchAdAccounts();
    }
  }, [activeTab, userToken, adAccounts.length, fetchAdAccounts]);

  // Load campaigns when ad account is selected
  useEffect(() => {
    if (selectedAdAccount && activeTab === 'campaigns') {
      fetchCampaigns();
    }
  }, [selectedAdAccount, activeTab, fetchCampaigns]);

  // Create Campaign
  const createCampaign = async () => {
    if (!selectedAdAccount || !userToken) {
      setError("Please select an ad account first");
      return;
    }

    if (!campaignData.name) {
      setError("Campaign name is required");
      return;
    }

    try {
      setLoading(true);
      setError("");
      const response = await axios.post("/api/facebook/campaigns/create-campaign", {
        accountId: selectedAdAccount.account_id,
        accessToken: userToken, // Use user token for ad account operations
        name: campaignData.name,
        objective: campaignData.objective,
        status: campaignData.status,
      });

      if (response.data.success) {
        setCreatedCampaignId(response.data.campaign.id);
        setWizardStep(2);
        alert("Campaign created successfully!");
      }
    } catch (err) {
      const errorMessage = err instanceof AxiosError
        ? err.response?.data?.error || err.message
        : "An unknown error occurred";
      setError("Failed to create campaign: " + errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Create Ad Set
  const createAdSet = async () => {
    if (!selectedAdAccount || !userToken || !createdCampaignId) {
      setError("Campaign must be created first");
      return;
    }

    if (!adSetData.name) {
      setError("Ad Set name is required");
      return;
    }

    try {
      setLoading(true);
      setError("");
      const response = await axios.post("/api/facebook/campaigns/create-adset", {
        accountId: selectedAdAccount.account_id,
        accessToken: userToken, // Use user token for ad account operations
        campaignId: createdCampaignId,
        name: adSetData.name,
        dailyBudget: adSetData.dailyBudget,
        billingEvent: adSetData.billingEvent,
        optimizationGoal: adSetData.optimizationGoal,
        targeting: adSetData.targeting,
        status: adSetData.status,
      });

      if (response.data.success) {
        setCreatedAdSetId(response.data.adset.id);
        setWizardStep(3);
        alert("Ad Set created successfully!");
      }
    } catch (err) {
      const errorMessage = err instanceof AxiosError
        ? err.response?.data?.error || err.message
        : "An unknown error occurred";
      setError("Failed to create ad set: " + errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Create Creative
  const createCreative = async () => {
    if (!selectedAdAccount || !userToken || !selectedPage || !selectedPage.id) {
      setError("Page must be selected first");
      return;
    }

    if (!creativeData.name || !creativeData.body) {
      setError("Creative name and body are required");
      return;
    }

    try {
      setLoading(true);
      setError("");
      const response = await axios.post("/api/facebook/campaigns/create-creative", {
        accountId: selectedAdAccount.account_id,
        accessToken: userToken, // Use user token for ad account operations
        name: creativeData.name,
        pageId: selectedPage.id,
        title: creativeData.title,
        body: creativeData.body,
        linkUrl: creativeData.linkUrl,
        imageUrl: creativeData.imageUrl,
        callToAction: {
          type: creativeData.callToActionType,
          value: { link: creativeData.linkUrl }
        }
      });

      if (response.data.success) {
        setCreatedCreativeId(response.data.creative.id);
        setWizardStep(4);
        alert("Ad Creative created successfully!");
      }
    } catch (err) {
      const errorMessage = err instanceof AxiosError
        ? err.response?.data?.error || err.message
        : "An unknown error occurred";
      setError("Failed to create creative: " + errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Create Final Ad
  const createAd = async () => {
    if (!selectedAdAccount || !userToken || !createdAdSetId || !createdCreativeId) {
      setError("Ad Set and Creative must be created first");
      return;
    }

    if (!adData.name) {
      setError("Ad name is required");
      return;
    }

    try {
      setLoading(true);
      setError("");
      const response = await axios.post("/api/facebook/campaigns/create-ad", {
        accountId: selectedAdAccount.account_id,
        accessToken: userToken, // Use user token for ad account operations
        name: adData.name,
        adsetId: createdAdSetId,
        creativeId: createdCreativeId,
        status: adData.status,
      });

      if (response.data.success) {
        alert("Ad created successfully! Your campaign is ready.");
        // Reset wizard
        setShowCampaignWizard(false);
        setWizardStep(1);
        setCreatedCampaignId('');
        setCreatedAdSetId('');
        setCreatedCreativeId('');
        setCampaignData({ name: '', objective: 'OUTCOME_TRAFFIC', status: 'PAUSED' });
        setAdSetData({
          name: '',
          dailyBudget: 10,
          billingEvent: 'IMPRESSIONS',
          optimizationGoal: 'REACH', // Changed to REACH which works with all objectives
          targeting: {
            geo_locations: { countries: ['US'] },
            age_min: 18,
            age_max: 65
          },
          status: 'PAUSED'
        });
        setCreativeData({
          name: '',
          title: '',
          body: '',
          linkUrl: '',
          imageUrl: '',
          callToActionType: 'LEARN_MORE'
        });
        setAdData({ name: '', status: 'PAUSED' });
        // Refresh campaigns list
        fetchCampaigns();
      }
    } catch (err) {
      const errorMessage = err instanceof AxiosError
        ? err.response?.data?.error || err.message
        : "An unknown error occurred";
      setError("Failed to create ad: " + errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Check account balance and payment status before activation
  const checkAccountBalance = async (): Promise<{ canRunAds: boolean; errors: string[]; warnings: string[] }> => {
    if (!selectedAdAccount || !userToken) {
      return { canRunAds: false, errors: ['No ad account selected'], warnings: [] };
    }

    try {
      const response = await axios.post("/api/facebook/campaigns/check-account-balance", {
        accountId: selectedAdAccount.account_id,
        accessToken: userToken,
      });

      if (response.data.success) {
        return {
          canRunAds: response.data.canRunAds,
          errors: response.data.errors || [],
          warnings: response.data.warnings || []
        };
      }
      return { canRunAds: false, errors: ['Failed to check account status'], warnings: [] };
    } catch (err) {
      const errorMessage = err instanceof AxiosError
        ? err.response?.data?.error || err.message
        : "An unknown error occurred";
      return { canRunAds: false, errors: [errorMessage], warnings: [] };
    }
  };

  // Activate campaign with balance check
  const handleActivateCampaign = async (campaignId: string) => {
    try {
      setLoading(true);
      setError("");

      // First check account balance
      const balanceCheck = await checkAccountBalance();

      if (!balanceCheck.canRunAds) {
        let errorMsg = "⚠️ Cannot activate campaign:\n\n";
        errorMsg += balanceCheck.errors.join('\n');

        if (balanceCheck.errors.some(e => e.includes('payment method'))) {
          errorMsg += "\n\n📝 Please add a payment method at:\nhttps://business.facebook.com/billing_hub/payment_methods";
        }

        alert(errorMsg);
        setLoading(false);
        return;
      }

      // Show warnings if any
      if (balanceCheck.warnings.length > 0) {
        const proceed = confirm(
          "⚠️ Warnings:\n\n" +
          balanceCheck.warnings.join('\n') +
          "\n\nDo you want to proceed with activation?"
        );
        if (!proceed) {
          setLoading(false);
          return;
        }
      }

      // Proceed with activation
      const response = await axios.post("/api/facebook/campaigns/update-campaign", {
        accountId: selectedAdAccount?.account_id,
        accessToken: userToken,
        campaignId,
        status: 'ACTIVE'
      });

      if (response.data.success) {
        alert("✅ Campaign activated successfully!");
        fetchCampaigns(); // Refresh the list
      }
    } catch (err) {
      const errorMessage = err instanceof AxiosError
        ? err.response?.data?.error || err.message
        : "An unknown error occurred";
      setError("Failed to activate campaign: " + errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Pause campaign
  const handlePauseCampaign = async (campaignId: string) => {
    if (!confirm('Are you sure you want to pause this campaign?')) {
      return;
    }

    try {
      setLoading(true);
      setError("");
      const response = await axios.post("/api/facebook/campaigns/update-campaign", {
        accountId: selectedAdAccount?.account_id,
        accessToken: userToken,
        campaignId,
        status: 'PAUSED'
      });

      if (response.data.success) {
        alert("Campaign paused successfully!");
        fetchCampaigns(); // Refresh the list
      }
    } catch (err) {
      const errorMessage = err instanceof AxiosError
        ? err.response?.data?.error || err.message
        : "An unknown error occurred";
      setError("Failed to pause campaign: " + errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Delete campaign
  const handleDeleteCampaign = async (campaignId: string) => {
    if (!confirm('⚠️ Are you sure you want to delete this campaign? This action cannot be undone!')) {
      return;
    }

    try {
      setLoading(true);
      setError("");
      const response = await axios.post("/api/facebook/campaigns/delete-campaign", {
        accountId: selectedAdAccount?.account_id,
        accessToken: userToken,
        campaignId
      });

      if (response.data.success) {
        alert("✅ Campaign deleted successfully!");
        fetchCampaigns(); // Refresh the list
      }
    } catch (err) {
      const errorMessage = err instanceof AxiosError
        ? err.response?.data?.error || err.message
        : "An unknown error occurred";
      setError("Failed to delete campaign: " + errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold text-black">Facebook Publisher</h1>
            {pages.length > 0 && (
              <div className="flex gap-3">
                <button
                  onClick={logout}
                  disabled={loading}
                  className="inline-flex items-center px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:bg-gray-400"
                >
                  Logout
                </button>
              </div>
            )}
          </div>

          {error && (
            <div className="mb-8 bg-red-100 border-l-4 border-red-500 text-black p-4 rounded">
              {error}
            </div>
          )}

          {!pages.length ? (
            <div className="flex flex-col items-center justify-center min-h-[400px] bg-white rounded-lg shadow-sm p-8">
              <h2 className="text-xl font-semibold text-black mb-6">Welcome to Facebook Publisher</h2>
              <button
                className="inline-flex items-center px-6 py-3 bg-blue-600 text-white text-base font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                onClick={loginWithFacebook}
                disabled={loading}
              >
                {loading ? "Loading..." : "Login with Facebook"}
              </button>
            </div>
          ) : (
            <>
              {/* Tabs */}
              <div className="mb-6">
                <div className="border-b border-gray-200">
                  <nav className="-mb-px flex space-x-8">
                    <button
                      onClick={() => setActiveTab('posts')}
                      className={`${activeTab === 'posts'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                    >
                      Posts
                    </button>
                    <button
                      onClick={() => setActiveTab('campaigns')}
                      className={`${activeTab === 'campaigns'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                    >
                      Ad Campaigns
                    </button>
                  </nav>
                </div>
              </div>

              {/* Posts Tab Content */}
              {activeTab === 'posts' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Publisher Form */}
                  <div className="bg-white rounded-lg shadow-sm p-6">
                    <h2 className="text-xl font-semibold text-black mb-6">Create New Post</h2>
                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-medium text-black mb-2">
                          Select Page
                        </label>
                        <select
                          className="mt-1 block w-full pl-3 pr-10 py-2 text-base text-black border-gray-300 focus:outline-none focus:ring-purple-500 focus:border-purple-500 rounded-md"
                          onChange={(e) => handlePageSelect(pages[e.target.value])}
                          value={selectedPage ? pages.indexOf(selectedPage) : ""}
                        >
                          <option value="">Select a page</option>
                          {pages.map((page, index) => (
                            <option key={page.id} value={index}>
                              {page.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-black mb-2">
                          Message
                        </label>
                        <textarea
                          placeholder="What's on your mind?"
                          value={message}
                          onChange={(e) => setMessage(e.target.value)}
                          className="mt-1 block w-full text-black border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500 sm:text-sm h-32"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-black mb-2">
                          Media URL
                        </label>
                        <input
                          type="url"
                          placeholder="Enter image URL"
                          value={mediaUrl}
                          onChange={(e) => setMediaUrl(e.target.value)}
                          className="mt-1 block w-full text-black border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                        />
                      </div>

                      <button
                        onClick={publishPost}
                        disabled={loading || !selectedPage}
                        className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-gray-400"
                      >
                        {loading ? (
                          <>
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Publishing...
                          </>
                        ) : (
                          "Publish Post"
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Posts List */}
                  <div className="bg-white rounded-lg shadow-sm p-6">
                    <h2 className="text-xl font-semibold text-black mb-6">Recent Posts</h2>
                    {loading ? (
                      <div className="text-center py-12">
                        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                        <p className="mt-4 text-black">Loading posts...</p>
                      </div>
                    ) : posts.length === 0 ? (
                      <div className="text-center py-12">
                        <p className="text-black text-lg">No posts found for this page.</p>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        {posts.map((post) => {
                          const imageUrl = post.attachments?.data?.[0]?.media?.image?.src;
                          return (
                            <div
                              key={post.id}
                              className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
                            >
                              {imageUrl && (
                                <img
                                  src={imageUrl}
                                  alt="Post"
                                  className="w-full h-48 object-cover"
                                />
                              )}
                              <div className="p-4">
                                <p className="text-black mb-3 line-clamp-3">
                                  {post.message || "(No text content)"}
                                </p>

                                <div className="flex gap-4 text-sm text-black mb-3">
                                  {post.reactions && (
                                    <span>👍 {post.reactions.summary.total_count}</span>
                                  )}
                                  {post.comments && (
                                    <span>💬 {post.comments.summary.total_count}</span>
                                  )}
                                  {post.shares && (
                                    <span>🔄 {post.shares.count}</span>
                                  )}
                                </div>

                                <p className="text-xs text-black mb-3">
                                  {formatDate(post.created_time)}
                                </p>

                                <div className="flex gap-2">
                                  <a
                                    href={post.permalink_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex-1 px-3 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 text-center"
                                  >
                                    View on Facebook
                                  </a>
                                  <button
                                    onClick={() => deletePost(post.id)}
                                    disabled={deletingPostId === post.id}
                                    className="px-3 py-2 bg-red-600 text-white text-sm rounded hover:bg-red-700 disabled:bg-gray-400"
                                  >
                                    {deletingPostId === post.id ? "..." : "Delete"}
                                  </button>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Ad Campaigns Tab Content */}
              {activeTab === 'campaigns' && (
                <div className="space-y-6">
                  {/* Ad Account Selection */}
                  <div className="bg-white rounded-lg shadow-sm p-6">
                    <h2 className="text-xl font-semibold text-black mb-4">Select Ad Account</h2>
                    {adAccounts.length === 0 ? (
                      <div className="text-center py-8">
                        <p className="text-black mb-4">
                          {loading ? 'Loading ad accounts...' : 'No ad accounts found.'}
                        </p>
                      </div>
                    ) : (
                      <div>
                        <label className="block text-sm font-medium text-black mb-2">
                          Ad Account
                        </label>
                        <select
                          className="mt-1 block w-full pl-3 pr-10 py-2 text-base text-black border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 rounded-md"
                          onChange={(e) => setSelectedAdAccount(adAccounts[parseInt(e.target.value)])}
                          value={selectedAdAccount ? adAccounts.indexOf(selectedAdAccount) : ""}
                        >
                          <option value="">Select an ad account</option>
                          {adAccounts.map((account, index) => (
                            <option key={account.id} value={index}>
                              {account.name} ({account.account_id})
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>

                  {/* Create Campaign Button */}
                  {selectedAdAccount && !showCampaignWizard && (
                    <div className="bg-white rounded-lg shadow-sm p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-semibold text-black">Your Campaigns</h2>
                        <button
                          onClick={() => setShowCampaignWizard(true)}
                          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 font-medium"
                        >
                          + Create New Campaign
                        </button>
                      </div>

                      {/* Campaigns List */}
                      <div className="space-y-4">
                        {campaigns.length === 0 ? (
                          <div className="text-center py-8">
                            <p className="text-black">No campaigns found. Create your first campaign!</p>
                          </div>
                        ) : (
                          campaigns.map((campaign) => (
                            <div key={campaign.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                              <div className="flex items-center justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2">
                                    <h3 className="font-semibold text-black">{campaign.name}</h3>
                                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${campaign.status === 'ACTIVE' ? 'bg-green-100 text-black' :
                                      campaign.status === 'PAUSED' ? 'bg-yellow-100 text-black' :
                                        'bg-gray-100 text-black'
                                      }`}>
                                      {campaign.status}
                                    </span>
                                  </div>
                                  <p className="text-sm text-black mt-1">
                                    Objective: {campaign.objective}
                                  </p>
                                  <p className="text-xs text-black mt-1">
                                    Created: {formatDate(campaign.created_time)}
                                  </p>
                                </div>
                                <div className="flex gap-2 ml-4">
                                  {campaign.status === 'PAUSED' && (
                                    <button
                                      onClick={() => handleActivateCampaign(campaign.id)}
                                      className="px-3 py-1.5 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 font-medium"
                                    >
                                      ▶ Activate
                                    </button>
                                  )}
                                  {campaign.status === 'ACTIVE' && (
                                    <button
                                      onClick={() => handlePauseCampaign(campaign.id)}
                                      className="px-3 py-1.5 bg-yellow-600 text-white text-sm rounded-md hover:bg-yellow-700 font-medium"
                                    >
                                      ⏸ Pause
                                    </button>
                                  )}
                                  <button
                                    onClick={() => handleDeleteCampaign(campaign.id)}
                                    className="px-3 py-1.5 bg-red-600 text-white text-sm rounded-md hover:bg-red-700 font-medium"
                                  >
                                    🗑️ Delete
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}

                  {/* Campaign Creation Wizard */}
                  {showCampaignWizard && selectedAdAccount && (
                    <div className="bg-white rounded-lg shadow-sm p-6">
                      <div className="mb-6">
                        <h2 className="text-xl font-semibold text-black mb-4">Create Ad Campaign</h2>

                        {/* Wizard Steps Indicator */}
                        <div className="flex items-center justify-between mb-8">
                          <div className="flex items-center space-x-2">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${wizardStep >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-300'}`}>
                              1
                            </div>
                            <span className="text-sm text-black font-medium">Campaign</span>
                          </div>
                          <div className="flex-1 h-1 bg-gray-300 mx-2">
                            <div className={`h-full ${wizardStep >= 2 ? 'bg-blue-600' : ''}`} style={{ width: wizardStep >= 2 ? '100%' : '0%' }}></div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${wizardStep >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-300'}`}>
                              2
                            </div>
                            <span className="text-sm text-black font-medium">Ad Set</span>
                          </div>
                          <div className="flex-1 h-1 bg-gray-300 mx-2">
                            <div className={`h-full ${wizardStep >= 3 ? 'bg-blue-600' : ''}`} style={{ width: wizardStep >= 3 ? '100%' : '0%' }}></div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${wizardStep >= 3 ? 'bg-blue-600 text-white' : 'bg-gray-300'}`}>
                              3
                            </div>
                            <span className="text-sm text-black font-medium">Creative</span>
                          </div>
                          <div className="flex-1 h-1 bg-gray-300 mx-2">
                            <div className={`h-full ${wizardStep >= 4 ? 'bg-blue-600' : ''}`} style={{ width: wizardStep >= 4 ? '100%' : '0%' }}></div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${wizardStep >= 4 ? 'bg-blue-600 text-white' : 'bg-gray-300'}`}>
                              4
                            </div>
                            <span className="text-sm text-black font-medium">Ad</span>
                          </div>
                        </div>
                      </div>

                      {/* Step 1: Create Campaign */}
                      {wizardStep === 1 && (
                        <div className="space-y-4">
                          <h3 className="text-lg font-semibold text-black">Step 1: Campaign Details</h3>
                          <div>
                            <label className="block text-sm font-medium text-black mb-2">
                              Campaign Name *
                            </label>
                            <input
                              type="text"
                              value={campaignData.name}
                              onChange={(e) => setCampaignData({ ...campaignData, name: e.target.value })}
                              className="mt-1 block text-black w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                              placeholder="e.g., Summer Sale 2025"
                              required
                            />
                            <p className="mt-1 text-xs text-black">
                              Required: Helps you identify and organize your campaigns
                            </p>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-black mb-2">
                              Campaign Objective *
                            </label>
                            <select
                              value={campaignData.objective}
                              onChange={(e) => setCampaignData({ ...campaignData, objective: e.target.value })}
                              className="mt-1 block w-full text-black border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                              required
                            >
                              <option value="OUTCOME_TRAFFIC">Traffic - Drive traffic to your website or app</option>
                              <option value="OUTCOME_AWARENESS">Awareness - Increase brand awareness and reach</option>
                              <option value="OUTCOME_ENGAGEMENT">Engagement - Get likes, comments, shares and interactions</option>
                              <option value="OUTCOME_LEADS">Leads - Collect leads and contacts</option>
                              <option value="OUTCOME_SALES">Sales - Drive purchases and conversions</option>
                              <option value="OUTCOME_APP_PROMOTION">App Promotion - Get app installs and engagement</option>
                            </select>
                            <p className="mt-1 text-xs text-black">
                              Required: Tells Facebook how to optimize your ad delivery and who to show ads to
                            </p>
                          </div>
                          <div className="flex gap-3 pt-4">
                            <button
                              onClick={() => setShowCampaignWizard(false)}
                              className="px-4 py-2 border border-gray-300 rounded-md text-black hover:bg-gray-50"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={createCampaign}
                              disabled={loading || !campaignData.name}
                              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400"
                            >
                              {loading ? 'Creating...' : 'Next: Create Ad Set'}
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Step 2: Create Ad Set */}
                      {wizardStep === 2 && (
                        <div className="space-y-4">
                          <h3 className="text-lg font-semibold text-black">Step 2: Ad Set Details</h3>
                          <div>
                            <label className="block text-sm font-medium text-black mb-2">
                              Ad Set Name *
                            </label>
                            <input
                              type="text"
                              value={adSetData.name}
                              onChange={(e) => setAdSetData({ ...adSetData, name: e.target.value })}
                              className="mt-1 block w-full text-black border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                              placeholder="e.g., US Audience 18-65"
                              required
                            />
                            <p className="mt-1 text-xs text-black">
                              Required: Helps you identify your audience targeting and budget settings
                            </p>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-black mb-2">
                              Daily Budget (USD) *
                            </label>
                            <input
                              type="number"
                              value={adSetData.dailyBudget}
                              onChange={(e) => setAdSetData({ ...adSetData, dailyBudget: parseFloat(e.target.value) })}
                              className="mt-1 block w-full text-black border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                              min="1"
                              step="0.01"
                              required
                            />
                            <p className="mt-1 text-xs text-black">
                              Required: Maximum amount you&apos;ll spend per day. Facebook requires at least $1/day
                            </p>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-black mb-2">
                                Min Age
                              </label>
                              <input
                                type="number"
                                value={adSetData.targeting.age_min}
                                onChange={(e) => setAdSetData({
                                  ...adSetData,
                                  targeting: { ...adSetData.targeting, age_min: parseInt(e.target.value) }
                                })}
                                className="mt-1 block w-full text-black border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                min="18"
                                max="65"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-black mb-2">
                                Max Age
                              </label>
                              <input
                                type="number"
                                value={adSetData.targeting.age_max}
                                onChange={(e) => setAdSetData({
                                  ...adSetData,
                                  targeting: { ...adSetData.targeting, age_max: parseInt(e.target.value) }
                                })}
                                className="mt-1 block w-full text-black border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                min="18"
                                max="65"
                              />
                            </div>
                          </div>
                          <div className="flex gap-3 pt-4">
                            <button
                              onClick={() => setWizardStep(1)}
                              className="px-4 py-2 border border-gray-300 rounded-md text-black hover:bg-gray-50"
                            >
                              Back
                            </button>
                            <button
                              onClick={createAdSet}
                              disabled={loading || !adSetData.name}
                              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400"
                            >
                              {loading ? 'Creating...' : 'Next: Create Creative'}
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Step 3: Create Creative */}
                      {wizardStep === 3 && (
                        <div className="space-y-4">
                          <h3 className="text-lg font-semibold text-black">Step 3: Ad Creative</h3>
                          <div>
                            <label className="block text-sm font-medium text-black mb-2">
                              Creative Name *
                            </label>
                            <input
                              type="text"
                              value={creativeData.name}
                              onChange={(e) => setCreativeData({ ...creativeData, name: e.target.value })}
                              className="mt-1 block w-full text-black border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                              placeholder="e.g., Summer Sale Creative"
                              required
                            />
                            <p className="mt-1 text-xs text-black">
                              Required: Internal name to identify this creative asset in your ad account
                            </p>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-black mb-2">
                              Ad Title
                            </label>
                            <input
                              type="text"
                              value={creativeData.title}
                              onChange={(e) => setCreativeData({ ...creativeData, title: e.target.value })}
                              className="mt-1 block w-full text-black border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                              placeholder="Headline for your ad"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-black mb-2">
                              Ad Text/Body *
                            </label>
                            <textarea
                              value={creativeData.body}
                              onChange={(e) => setCreativeData({ ...creativeData, body: e.target.value })}
                              className="mt-1 block w-full text-black border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm h-24"
                              placeholder="Write your ad copy here..."
                              required
                            />
                            <p className="mt-1 text-xs text-black">
                              Required: This is the main message that appears in your ad
                            </p>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-black mb-2">
                              Link URL
                            </label>
                            <input
                              type="url"
                              value={creativeData.linkUrl}
                              onChange={(e) => setCreativeData({ ...creativeData, linkUrl: e.target.value })}
                              className="mt-1 block w-full text-black border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                              placeholder="https://your-website.com"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-black mb-2">
                              Image URL
                            </label>
                            <input
                              type="url"
                              value={creativeData.imageUrl}
                              onChange={(e) => setCreativeData({ ...creativeData, imageUrl: e.target.value })}
                              className="mt-1 block w-full text-black border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                              placeholder="https://example.com/image.jpg"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-black mb-2">
                              Call to Action
                            </label>
                            <select
                              value={creativeData.callToActionType}
                              onChange={(e) => setCreativeData({ ...creativeData, callToActionType: e.target.value })}
                              className="mt-1 block w-full text-black border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            >
                              <option value="LEARN_MORE">Learn More</option>
                              <option value="SHOP_NOW">Shop Now</option>
                              <option value="SIGN_UP">Sign Up</option>
                              <option value="DOWNLOAD">Download</option>
                              <option value="BOOK_TRAVEL">Book Travel</option>
                              <option value="CONTACT_US">Contact Us</option>
                            </select>
                          </div>
                          <div className="flex gap-3 pt-4">
                            <button
                              onClick={() => setWizardStep(2)}
                              className="px-4 py-2 border border-gray-300 rounded-md text-black hover:bg-gray-50"
                            >
                              Back
                            </button>
                            <button
                              onClick={createCreative}
                              disabled={loading || !creativeData.name || !creativeData.body}
                              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400"
                            >
                              {loading ? 'Creating...' : 'Next: Create Ad'}
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Step 4: Create Final Ad */}
                      {wizardStep === 4 && (
                        <div className="space-y-4">
                          <h3 className="text-lg font-semibold text-black">Step 4: Final Ad</h3>
                          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                            <p className="text-black text-sm">
                              ✓ Campaign created<br />
                              ✓ Ad Set created<br />
                              ✓ Creative created<br />
                              Now create the final ad to complete your campaign!
                            </p>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-black mb-2">
                              Ad Name *
                            </label>
                            <input
                              type="text"
                              value={adData.name}
                              onChange={(e) => setAdData({ ...adData, name: e.target.value })}
                              className="mt-1 block w-full text-black border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                              placeholder="e.g., Summer Sale Ad #1"
                              required
                            />
                            <p className="mt-1 text-xs text-black">
                              Required: Helps you track and manage individual ads within your ad set
                            </p>
                          </div>
                          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <p className="text-black text-sm">
                              <strong>📋 Draft Mode:</strong> Your campaign will be created in PAUSED state.
                              You can review and activate it after creation once we verify your payment method is set up.
                            </p>
                          </div>
                          <div className="flex gap-3 pt-4">
                            <button
                              onClick={() => setWizardStep(3)}
                              className="px-4 py-2 border border-gray-300 rounded-md text-black hover:bg-gray-50"
                            >
                              Back
                            </button>
                            <button
                              onClick={createAd}
                              disabled={loading || !adData.name}
                              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400"
                            >
                              {loading ? 'Creating...' : '🚀 Complete Campaign'}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
      <CopilotSidebar
        agent="facebook_publisher_agent"
        labels={{
          title: "Popup Assistant",
          initial: "Hi! I'm your Facebook Publisher assistant. How can I help?",
        }}
        defaultOpen={true}
        clickOutsideToClose={true}
        hitEscapeToClose={true}
        suggestions={[
          { title: "What's my selected page?", message: "Tell me about my currently selected Facebook page." },
          { title: "What's my post engagement?", message: "Show me the engagement metrics for my posts." },
          { title: "Total number of posts", message: "How many posts have I published?" },
          { title: "How to publish a post?", message: "Guide me through publishing a post." },
          { title: "How to delete a post?", message: "How can I delete one of my posts?" },
          { title: "How to connect my Facebook page?", message: "Help me connect my Facebook page." },
          { title: "How to view my post insights?", message: "Show me the insights for my posts." },
          { title: "How to schedule a post?", message: "Guide me through scheduling a post." },
          { title: "How to edit a published post?", message: "Can I edit a post after publishing it?" },
          { title: "How to manage post comments?", message: "Help me manage comments on my posts." },
          { title: "Publish a post with text", message: "Help me publish a post that contains only text." },
        ]}
      />
    </div>
  );
}
