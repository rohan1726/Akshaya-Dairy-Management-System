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

3. **Project settings**  
   You can leave **Root Directory** empty (repo root). The root `vercel.json` runs install and build for the backend, and the root `api/` folder serves the API.  
   Or set **Root Directory** to `backend` for a backend-only deploy; then use **Build Command** `npm run build`.

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

## Get your backend, admin, and frontend links

### Backend API link (you already have this)
- In **Vercel** → your project → **Deployments** → open the latest deployment.
- Your API URL is the deployment URL, e.g. `https://akshaya-dairy-management-system.vercel.app`.
- Use it as: **API** = that URL, **Health** = `https://your-project.vercel.app/health`, **Swagger** = `https://your-project.vercel.app/api-docs`.

### Admin panel link
Deploy the admin app as a **separate Vercel project**:

1. **Vercel** → **Add New Project** → **Import** the **same** GitHub repo (`rohan1726/Akshaya-Dairy-Management-System`).
2. Set **Root Directory** to `frontend-admin`.  
3. **Environment variable:** add `VITE_API_URL` = your backend URL, e.g. `https://akshaya-dairy-management-system.vercel.app` (no trailing slash).
4. Deploy. Your **admin link** is the new project’s URL (e.g. `https://akshaya-dairy-admin.vercel.app`).

### Driver/Center panel link
Same idea, second frontend:

1. **Vercel** → **Add New Project** → **Import** the same repo again.
2. Set **Root Directory** to `frontend` (the driver/center app).
3. **Environment variable:** add `VITE_API_URL` = your backend URL (same as above).
4. Deploy. Your **driver/center link** is this project’s URL.

So you end up with **3 Vercel projects** (same repo, different root): one for the API, one for admin, one for driver/center. Each has its own link.

## Default login (after seed)

- **Admin:** mobile `9999999999` (or value from `ADMIN_MOBILE`), password `admin123` (or `ADMIN_PASSWORD`).

## Tech stack

- **Backend:** Node.js, Express, TypeScript, MongoDB (Mongoose), JWT, Swagger.
- **Frontend:** React 18, TypeScript, Vite, Bootstrap, Axios.

## Security

- Keep `.env` and real passwords out of the repo. Use Vercel env vars and local `.env` only.
- Use a strong `JWT_SECRET` in production.

## Vercel build failed with `tsc: command not found`?

The repo root has a `vercel.json` that runs `npm install` in `backend/` and then `npm run build` there, so the build should pass. If it still fails, set **Root Directory** to `backend` in Vercel → **Settings** → **General**, then redeploy.
