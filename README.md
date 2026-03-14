# Akshaya Dairy Management System

Dairy milk collection and management: backend API (Node + Express + MongoDB), admin panel, and driver/center panel.

## Project structure

- **backend/** – API (Express, TypeScript, MongoDB). Deploy this to Vercel.
- **frontend-admin/** – Admin panel (React, Vite). Port 3001.
- **frontend/** – Driver/Center panel (React, Vite). Port 3002.

## Run locally

**Prerequisites:** Node.js 18+, MongoDB (local or [MongoDB Atlas](https://cloud.mongodb.com)).

1. **Backend**
   ```bash
   cd backend
   cp .env.example .env
   # Edit .env: set MONGODB_URI and JWT_SECRET
   npm install
   npm run seed    # creates default admin if no users (optional)
   npm run dev
   ```
   API: http://localhost:3000 | Swagger: http://localhost:3000/api-docs

2. **Run all (backend + admin + driver panel) from project root**
   ```bash
   npm install
   npm run dev
   ```
   - Backend: http://localhost:3000  
   - Admin: http://localhost:3001  
   - Driver/Center: http://localhost:3002  

## Deploy backend to Vercel (from GitHub)

1. Push this repo to GitHub.

2. In [Vercel](https://vercel.com): **Add New Project** → Import your GitHub repo.

3. **Project settings (required)**  
   Go to **Project → Settings → General**:
   - **Root Directory:** click **Edit**, set to `backend`, then **Save**.  
     (If you skip this, the build will fail with `tsc: command not found` because only the backend has the API and TypeScript.)
   - **Build Command:** `npm run build` (default)
   - **Output Directory:** leave default (not used for serverless API).

4. **Environment variables** (Vercel → Project → Settings → Environment Variables)

   Add:

   | Name         | Value |
   |-------------|--------|
   | `MONGODB_URI` | Your MongoDB Atlas connection string (see below) |
   | `JWT_SECRET`  | A long random string for production |

   **MongoDB Atlas connection string**

   - In MongoDB Atlas: Cluster → Connect → Drivers → copy the connection string.
   - Replace `<password>` with your database user password.
   - Your DB user: **rohanbhalkar92_db_user** (use the password you set in Atlas).
   - Example format:  
     `mongodb+srv://rohanbhalkar92_db_user:YOUR_PASSWORD@CLUSTER.mongodb.net/akshaya_dairy?retryWrites=true&w=majority`  
   - Do **not** put the real password in the repo; set `MONGODB_URI` only in Vercel (and in local `.env`, which is gitignored).

5. Deploy. Vercel will build and run the backend; all API routes are served by one serverless function.

6. **First-time setup:** Run the seed once so an admin user exists. From your machine (with `MONGODB_URI` in `backend/.env` pointing to the same Atlas database):
   ```bash
   cd backend
   npm run seed
   ```
   Default admin (if seed creates it): mobile `9999999999`, password `admin123` (or set `ADMIN_PASSWORD` / `ADMIN_MOBILE` in `.env` when seeding).

## Default login (after seed)

- **Admin:** mobile `9999999999` (or value from `ADMIN_MOBILE`), password `admin123` (or `ADMIN_PASSWORD`).

## Tech stack

- **Backend:** Node.js, Express, TypeScript, MongoDB (Mongoose), JWT, Swagger.
- **Frontend:** React 18, TypeScript, Vite, Bootstrap, Axios.

## Security

- Keep `.env` and real passwords out of the repo. Use Vercel env vars and local `.env` only.
- Use a strong `JWT_SECRET` in production.

## Vercel build failed with `tsc: command not found`?

Set **Root Directory** to `backend`: Vercel → your project → **Settings** → **General** → **Root Directory** → **Edit** → enter `backend` → **Save**, then redeploy. The API lives in `backend/`; building from repo root does not install backend dependencies, so `tsc` is missing.
