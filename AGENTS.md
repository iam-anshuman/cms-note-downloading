<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# CMS Note Downloading - Deployment Guide

## Tech Stack
- **Frontend**: Next.js 16.2.4 with React 19, Tailwind CSS 4
- **Database**: Drizzle ORM with SQLite (local) / Turso (production)
- **Storage**: Local filesystem (dev) / Cloudflare R2 (production)
- **Auth**: JWT in HTTP-only cookies
- **Payments**: Razorpay

## Environment Variables

### Required for Development (.env.local)
```
JWT_SECRET=your-jwt-secret-key
ADMIN_EMAILS=admin@academy.com
ADMIN_PASSWORD=Admin@1234
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_xxx
RAZORPAY_KEY_SECRET=xxx
RESEND_API_KEY=re_xxx
```

### Required for Vercel Production
```
JWT_SECRET=<generate-secure-secret>
ADMIN_EMAILS=admin@academy.com
ADMIN_PASSWORD=<secure-admin-password>
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
NEXT_PUBLIC_RAZORPAY_KEY_ID=<from-razorpay-dashboard>
RAZORPAY_KEY_SECRET=<from-razorpay-dashboard>
RESEND_API_KEY=<from-resend-dashboard>

# Turso Database (for production database)
TURSO_DATABASE_URL=libsql://your-db-name.turso.io
TURSO_AUTH_TOKEN=<from-turso-dashboard>

# Cloudflare R2 (for file storage)
R2_ACCOUNT_ID=<from-cloudflare-dashboard>
R2_ACCESS_KEY_ID=<from-r2-api-tokens>
R2_SECRET_ACCESS_KEY=<from-r2-api-tokens>
R2_BUCKET_NAME=cms-notes-files
R2_PUBLIC_URL=https://cdn.yourdomain.com  # optional, for custom domain
```

## Database Setup

### Local Development
1. Database is automatically created at `data/cms.db`
2. Admin user is auto-seeded on first run (admin@academy.com / Admin@1234)

### Turso Database (Production)
1. Create a free Turso database at https://turso.tech
2. Copy the database URL (`libsql://your-db-name.turso.io`)
3. Generate an auth token from the Turso dashboard
4. Add `TURSO_DATABASE_URL` and `TURSO_AUTH_TOKEN` to Vercel env vars
5. Push schema: `npm run db:push`

## Deployment to Vercel

### Step 1: Push to GitHub
```bash
git add .
git commit -m "Setup for Vercel deployment"
git push origin main
```

### Step 2: Import to Vercel
1. Go to https://vercel.com/new
2. Import your GitHub repository
3. Add environment variables in Vercel dashboard

### Step 3: Configure R2 for Production
1. Create R2 bucket in Cloudflare Dashboard
2. Generate S3-compatible API tokens
3. Add R2 credentials to Vercel environment variables

## Storage

The app supports dual storage modes:
- **Local**: When R2 env vars not set (development)
- **R2**: When all R2 credentials provided (production)

New uploads go to R2; old local files automatically fallback to local storage.

## Commands
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run db:push      # Push schema to Turso
npm run db:studio   # Open Drizzle Studio
```