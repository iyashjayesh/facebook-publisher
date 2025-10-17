import axios, { AxiosError } from "axios";
import { useRouter } from "next/router";
import { useCallback, useEffect, useState } from "react";

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

export default function PostsPage() {
    const router = useRouter();
    const [pages, setPages] = useState<FacebookPage[]>([]);
    const [selectedPage, setSelectedPage] = useState<FacebookPage | null>(null);
    const [posts, setPosts] = useState<FacebookPost[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [deletingPostId, setDeletingPostId] = useState<string | null>(null);

    const handlePageSelect = useCallback((page: FacebookPage | null) => {
        if (!page) return;
        setSelectedPage(page);
    }, []);

    useEffect(() => {
        // Load Facebook data from cookie
        const loadFacebookData = () => {
            const cookies = document.cookie.split(';');
            const fbCookie = cookies.find(c => c.trim().startsWith('fbData='));

            if (fbCookie) {
                try {
                    const base64Data = fbCookie.split('=')[1];
                    const decodedData = atob(base64Data);
                    const fbData = JSON.parse(decodedData);
                    if (fbData.pages && fbData.pages.length > 0) {
                        setPages(fbData.pages);
                        handlePageSelect(fbData.pages[0]);
                    }
                } catch (err) {
                    console.error('Error parsing Facebook data:', err);
                    setError('Error loading Facebook data. Please try logging in again.');
                }
            } else {
                // No Facebook data, redirect to home
                router.push('/');
            }
        };

        loadFacebookData();
    }, [router, handlePageSelect]);

    useEffect(() => {
        if (selectedPage) {
            fetchPosts();
        }
    }, [selectedPage]);

    const fetchPosts = async () => {
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
    };

    const logout = async () => {
        try {
            setLoading(true);
            await axios.post("/api/auth/logout");
            // Redirect to home page
            router.push('/');
        } catch (err) {
            const errorMessage = err instanceof AxiosError
                ? err.response?.data?.error || err.message
                : "An unknown error occurred";
            setError("Failed to logout: " + errorMessage);
            setLoading(false);
        }
    };

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
        <div className="min-h-screen p-4 bg-gray-50">
            <div className="max-w-6xl mx-auto">
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-3xl font-bold">Manage Posts</h1>
                    <div className="flex gap-2">
                        <button
                            onClick={() => router.push('/')}
                            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                        >
                            ← Back to Publisher
                        </button>
                        <button
                            onClick={logout}
                            disabled={loading}
                            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:bg-gray-400"
                        >
                            Logout
                        </button>
                    </div>
                </div>

                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                        {error}
                    </div>
                )}

                {pages.length > 0 && (
                    <div className="mb-6 bg-white p-4 rounded-lg shadow">
                        <label className="block text-gray-700 text-sm font-bold mb-2">
                            Select Page
                        </label>
                        <select
                            className="border rounded w-full md:w-96 py-2 px-3"
                            onChange={(e) => handlePageSelect(pages[parseInt(e.target.value)])}
                            value={selectedPage ? pages.indexOf(selectedPage) : ""}
                        >
                            {pages.map((page, index) => (
                                <option key={page.id} value={index}>
                                    {page.name}
                                </option>
                            ))}
                        </select>
                    </div>
                )}

                {loading ? (
                    <div className="text-center py-12">
                        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                        <p className="mt-4 text-gray-600">Loading posts...</p>
                    </div>
                ) : posts.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-lg shadow">
                        <p className="text-gray-600 text-lg">No posts found for this page.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {posts.map((post) => {
                            const imageUrl = post.attachments?.data?.[0]?.media?.image?.src;
                            return (
                                <div
                                    key={post.id}
                                    className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
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
                                                <span>likes {post.reactions.summary.total_count}</span>
                                            )}
                                            {post.comments && (
                                                <span>comments {post.comments.summary.total_count}</span>
                                            )}
                                            {post.shares && (
                                                <span>repost count: {post.shares.count}</span>
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
    );
}

