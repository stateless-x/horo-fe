# Horo Frontend - Deployment Guide

## Railway Deployment

This frontend application is configured to deploy on Railway using Bun.

### Required Environment Variables

Set these environment variables in your Railway project settings:

#### Production URLs
```bash
NEXT_PUBLIC_API_URL=https://api-horo.up.railway.app
BETTER_AUTH_URL=https://สายมู.com
```

#### Authentication Secrets
```bash
BETTER_AUTH_SECRET=<generate-a-secure-random-string>
```

#### OAuth Credentials (Google)
Get from: https://console.cloud.google.com/apis/credentials
```bash
GOOGLE_CLIENT_ID=<your-google-oauth-client-id>
GOOGLE_CLIENT_SECRET=<your-google-oauth-client-secret>
```

#### OAuth Credentials (Twitter/X)
Get from: https://developer.x.com/en/portal/dashboard
```bash
TWITTER_CLIENT_ID=<your-twitter-oauth2-client-id>
TWITTER_CLIENT_SECRET=<your-twitter-oauth2-client-secret>
```

### Deployment Process

1. **Connect Repository**: Connect your GitHub repository to Railway
2. **Set Environment Variables**: Add all required environment variables in Railway dashboard
3. **Deploy**: Railway will automatically:
   - Install dependencies with `bun install`
   - Build the Next.js app with `bun run build`
   - Start the server with `bun run start`

### Health Check

Railway will check the `/` endpoint to verify the application is running.

### Domain Setup

1. In Railway, go to your service settings
2. Add custom domain: `สายมู.com` (or the punycode version: `xn--y3cbx6azb.com`)
3. Update DNS records as instructed by Railway

### Important Notes

- **NEXT_PUBLIC_API_URL**: Must be set to the backend API URL for the frontend to communicate with the backend
- **BETTER_AUTH_URL**: Must match the frontend URL for OAuth callbacks to work
- **OAuth Credentials**: Must be configured in Google/Twitter developer consoles with the correct callback URLs:
  - Google: `https://api-horo.up.railway.app/api/auth/callback/google`
  - Twitter: `https://api-horo.up.railway.app/api/auth/callback/twitter`

### Troubleshooting

**Loading forever / Stuck on "กำลังโหลด..."**:
- Check that `NEXT_PUBLIC_API_URL` is set correctly in Railway
- Verify CORS is configured on the backend to allow your domain
- Check browser console for network errors

**Authentication not working**:
- Verify OAuth credentials are correct
- Check that callback URLs match in OAuth provider settings
- Ensure `BETTER_AUTH_URL` matches your frontend domain

**Build failures**:
- Check that all dependencies are in `package.json`
- Verify TypeScript compilation passes: `bun run type-check`
- Review build logs in Railway dashboard
