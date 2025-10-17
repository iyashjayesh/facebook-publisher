import axios, { AxiosError } from "axios";
import { useRouter } from "next/router";
import { useCallback, useEffect, useState } from "react";

interface FacebookPage {
  id: string;
  name: string;
  access_token: string;
}

export default function Home() {
  const router = useRouter();
  const [pages, setPages] = useState<FacebookPage[]>([]);
  const [selectedPage, setSelectedPage] = useState<FacebookPage | null>(null);
  const [pageToken, setPageToken] = useState("");
  const [pageId, setPageId] = useState("");
  const [message, setMessage] = useState("");
  const [mediaUrl, setMediaUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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
      const res = await axios.post("/api/facebook/publish", {
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

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="w-full max-w-md mb-6">
        {pages.length > 0 ? (
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">Facebook Publisher</h1>
            <div className="flex gap-2">
              <button
                onClick={() => router.push('/posts')}
                className="px-4 py-2 bg-purple-600 text-white text-sm rounded hover:bg-purple-700"
              >
                Manage Posts
              </button>
              <button
                onClick={logout}
                disabled={loading}
                className="px-4 py-2 bg-red-600 text-white text-sm rounded hover:bg-red-700 disabled:bg-gray-400"
              >
                Logout
              </button>
            </div>
          </div>
        ) : (
          <h1 className="text-2xl font-bold text-center">Facebook Publisher</h1>
        )}
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 w-full max-w-md">
          {error}
        </div>
      )}

      {!pages.length ? (
        <button
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          onClick={loginWithFacebook}
          disabled={loading}
        >
          {loading ? "Loading..." : "Login with Facebook"}
        </button>
      ) : (
        <div className="w-full max-w-md">
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Select Page
            </label>
            <select
              className="border rounded w-full py-2 px-3"
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

          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Message
            </label>
            <textarea
              placeholder="What's on your mind?"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="border rounded w-full py-2 px-3 h-24"
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Media URL
            </label>
            <input
              placeholder="Enter image URL"
              value={mediaUrl}
              onChange={(e) => setMediaUrl(e.target.value)}
              className="border rounded w-full py-2 px-3"
            />
          </div>

          <button
            onClick={publishPost}
            disabled={loading || !selectedPage}
            className="w-full px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-400"
          >
            {loading ? "Publishing..." : "Publish Post"}
          </button>
        </div>
      )}
    </div>
  );
}
