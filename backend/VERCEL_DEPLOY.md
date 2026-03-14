# Deploy Akshaya Dairy Backend to Vercel

The backend is set up to run on Vercel as **one app** (all routes go to a single serverless function). No need to run files individually.

## Steps

1. **Set project root**  
   In Vercel: Project Settings → General → **Root Directory** → set to `backend`  
   (If your repo root is the backend folder, skip this.)

2. **Environment variables**  
   In Vercel: Project Settings → Environment Variables — add:
   - `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`
   - For production DB (e.g. Neon, Supabase): set `DB_SSL=true` if required
   - `NODE_ENV=production`
   - `JWT_SECRET` (or whatever your app uses for auth)

3. **Database migrations**  
   Vercel does not run migrations automatically. After deploy:
   - Run migrations from your machine (or CI) against the production DB:
     ```bash
     cd backend
     npm run migrate
     ```
   - Or use your DB provider’s migration/run step.

4. **Deploy**  
   Push to Git or run `vercel` from the repo root.  
   Build runs `npm run build`; all traffic is sent to the Express app via `/api`.

## Files used on Vercel

- `vercel.json` – rewrites all requests to `/api`
- `api/index.js` – entry that exports the built Express app from `dist/app.js`
- `src/app.ts` – does not call `app.listen()` when `VERCEL` env is set

## Files not needed on Vercel (in `.vercelignore`)

Tests, dev config, logs, and local `.env` are ignored so only what’s needed to run the app is deployed.
