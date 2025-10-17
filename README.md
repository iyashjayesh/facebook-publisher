This is a [Next.js](https://nextjs.org) project for publishing posts to Facebook pages.

## Features

- 🔐 Facebook OAuth authentication
- 📄 Select from multiple Facebook pages
- 📝 Publish text posts
- 🖼️ Publish photo posts with URLs
- 🎥 Support for video posts
- 📊 View all posts from your Facebook page
- ❌ Delete posts directly from the app
- 💬 See post engagement (likes, comments, shares)

## Getting Started

### 1. Setup Facebook App

1. Go to [Facebook Developers](https://developers.facebook.com/apps/)
2. Create a new app or use an existing one
3. Add the following permissions:
   - `pages_show_list`
   - `pages_read_engagement`
   - `pages_manage_posts`
   - `pages_manage_engagement`

### 2. Configure Environment Variables

Create a `.env.local` file in the root directory:

```bash
# Facebook App Configuration
NEXT_PUBLIC_FB_APP_ID=your_app_id_here
FB_APP_SECRET=your_app_secret_here
NEXT_PUBLIC_FB_REDIRECT_URI=http://localhost:3000/api/auth/callback
```

**Important:** Never commit `.env.local` to version control!

### 3. Install Dependencies and Run

First, install the dependencies:

```bash
npm install
```

Then run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Usage

### Publishing Posts

1. Click "Login with Facebook"
2. Authorize the app with your Facebook account
3. Select a page from the dropdown
4. Enter your message and/or media URL
5. Click "Publish Post"

### Managing Posts

1. After logging in, click the "Manage Posts" button
2. Select the page you want to manage
3. View all recent posts with engagement metrics
4. Click "View on Facebook" to open the post
5. Click "Delete" to remove a post (with confirmation)

### Logging Out

1. Click the red "Logout" button in the top-right corner (available on both pages)
2. Your session will be cleared and you'll return to the login screen

## API Routes

- `/api/auth/login` - Initiates Facebook OAuth flow
- `/api/auth/callback` - Handles OAuth callback and stores credentials
- `/api/auth/logout` - Clears session and logs out the user
- `/api/facebook/publish` - Publishes posts to Facebook pages
- `/api/facebook/posts` - Fetches posts from a Facebook page
- `/api/facebook/delete-post` - Deletes a post from Facebook

## Project Structure

```
src/
├── pages/
│   ├── index.tsx                    # Main publisher UI
│   ├── posts.tsx                    # Posts management UI
│   └── api/
│       ├── auth/
│       │   ├── login.ts             # OAuth initialization
│       │   ├── callback.ts          # OAuth callback handler
│       │   └── logout.ts            # Logout handler
│       └── facebook/
│           ├── publish.ts           # Publishes posts
│           ├── posts.ts             # Fetches posts
│           └── delete-post.ts       # Deletes posts
```

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn-pages-router) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/pages/building-your-application/deploying) for more details.
