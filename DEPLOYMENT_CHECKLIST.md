# Deployment Checklist - CMS Note Downloading

## Pre-Deployment Verification ✅

### API Endpoints Tested
- [x] GET /api/notes - Returns paginated notes
- [x] GET /api/bundles - Returns active bundles
- [x] GET /api/dashboard/admin - Returns stats
- [x] GET /api/customers/admin - Returns customer list
- [x] POST /api/auth/login - Admin login works
- [x] POST /api/auth/signup - User signup works
- [x] POST /api/notes/admin/upload - File upload to R2
- [x] GET /api/notes/[id]/file - File download (local fallback)

### Storage Verified
- [x] R2 upload - Files upload to Cloudflare R2
- [x] R2 download - Files served from R2
- [x] Local fallback - Old files served from local storage

### Build Verified
- [x] Next.js build passes
- [x] TypeScript compiles without errors
- [x] Lint passes

---

## Vercel Deployment Steps

### 1. Environment Variables (Required)
```
JWT_SECRET=<generate-a-secure-random-string>
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
NEXT_PUBLIC_RAZORPAY_KEY_ID=<from-razorpay-dashboard>
RAZORPAY_KEY_SECRET=<from-razorpay-dashboard>
RESEND_API_KEY=<from-resend-dashboard>
```

### 2. R2 Storage (Optional - for production)
```
R2_ACCOUNT_ID=<from-cloudflare-dashboard>
R2_ACCESS_KEY_ID=<from-r2-api-tokens>
R2_SECRET_ACCESS_KEY=<from-r2-api-tokens>
R2_BUCKET_NAME=cms-notes-files
R2_PUBLIC_URL=https://your-account-id.r2.cloudflarestorage.com
```

### 3. Deploy
1. Go to https://vercel.com/new
2. Import `cms-note-downloading` repo
3. Select branch: `migrate_to_cloudflare`
4. Add environment variables
5. Deploy

---

## Migration Summary

| Component | Before | After |
|-----------|--------|-------|
| Database | SQLite (better-sqlite3) | Drizzle ORM + libsql |
| Storage | Local filesystem | Cloudflare R2 (with fallback) |
| ORM | Direct SQL | Drizzle with typed queries |
| Auth | JWT in cookies | Same (compatible) |
| Deployment | Docker | Vercel + Cloudflare |

## Files Changed
- `lib/db.ts` - Drizzle client with D1 support
- `lib/db/schema.ts` - Database schema
- `lib/r2.ts` - R2 storage client
- `lib/storage.ts` - Unified storage (R2 + local)
- `lib/auth.js` - Fixed for Drizzle
- `app/api/*` - All routes updated for Drizzle
- `package.json` - Added deployment scripts
- `wrangler.toml` - Cloudflare config
- `vercel.json` - Vercel config