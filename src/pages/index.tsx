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
            color: '#111827'
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
              color: '#374151',
              fontSize: '14px'
            }}>
              {message}
            </p>
          </div>
          <p style={{
            fontSize: '14px',
            color: '#6b7280',
            marginBottom: '20px',
            margin: '0 0 20px 0'
          }}>
            Publishing to: <strong style={{ color: '#111827' }}>{pageName}</strong>
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
          <p style={{ margin: 0, color: '#6b7280', fontSize: '16px' }}>Publishing your post...</p>
        </div>
      )}

      {step === 'done' && (
        <div style={{ textAlign: 'center', padding: '20px 0' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>✅</div>
          <p style={{ margin: 0, color: '#059669', fontWeight: 600, fontSize: '16px' }}>
            Post Published Successfully!
          </p>
        </div>
      )}

      {step === 'error' && (
        <div style={{ textAlign: 'center', padding: '20px 0' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>❌</div>
          <p style={{ margin: 0, color: '#dc2626', fontWeight: 600, fontSize: '16px', marginBottom: '8px' }}>
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

export default function Home() {
  const [pages, setPages] = useState<FacebookPage[]>([]);
  const [selectedPage, setSelectedPage] = useState<FacebookPage | null>(null);
  const [pageToken, setPageToken] = useState("");
  const [pageId, setPageId] = useState("");
  const [message, setMessage] = useState("");
  const [mediaUrl, setMediaUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [posts, setPosts] = useState<FacebookPost[]>([]);
  const [deletingPostId, setDeletingPostId] = useState<string | null>(null);

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
      setMessage("");
      setMediaUrl("");
      setError("");
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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Facebook Publisher</h1>
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
            <div className="mb-8 bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded">
              {error}
            </div>
          )}

          {!pages.length ? (
            <div className="flex flex-col items-center justify-center min-h-[400px] bg-white rounded-lg shadow-sm p-8">
              <h2 className="text-xl font-semibold text-gray-700 mb-6">Welcome to Facebook Publisher</h2>
              <button
                className="inline-flex items-center px-6 py-3 bg-blue-600 text-white text-base font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                onClick={loginWithFacebook}
                disabled={loading}
              >
                {loading ? "Loading..." : "Login with Facebook"}
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Publisher Form */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Create New Post</h2>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Select Page
                    </label>
                    <select
                      className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-purple-500 focus:border-purple-500 rounded-md"
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
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Message
                    </label>
                    <textarea
                      placeholder="What's on your mind?"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500 sm:text-sm h-32"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Media URL
                    </label>
                    <input
                      type="url"
                      placeholder="Enter image URL"
                      value={mediaUrl}
                      onChange={(e) => setMediaUrl(e.target.value)}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
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
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Recent Posts</h2>
                {loading ? (
                  <div className="text-center py-12">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    <p className="mt-4 text-gray-600">Loading posts...</p>
                  </div>
                ) : posts.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-gray-600 text-lg">No posts found for this page.</p>
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
                            <p className="text-gray-800 mb-3 line-clamp-3">
                              {post.message || "(No text content)"}
                            </p>

                            <div className="flex gap-4 text-sm text-gray-600 mb-3">
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

                            <p className="text-xs text-gray-500 mb-3">
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
