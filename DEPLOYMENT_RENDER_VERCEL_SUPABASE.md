# 🚀 Deploy to Render (Backend) + Vercel (Frontend) + Supabase (Database)

> Complete step-by-step guide to deploy TaskFlow using Render, Vercel, and Supabase

---

## **📋 Prerequisites**

- GitHub account with Taskflow pushed
- Supabase account (free): https://supabase.com
- Render account (free): https://render.com
- Vercel account (free): https://vercel.com

---

## **STEP 1: Setup Database on Supabase ✅**

### **1.1 Create Supabase Account**
1. Go to [supabase.com](https://supabase.com)
2. Click **"Start your project"**
3. Sign up with GitHub
4. Create new project:
   - **Name:** `taskflow`
   - **Database Password:** Create strong password (save it!)
   - **Region:** Choose closest to you (e.g., `us-east-1`)
5. Wait for project to initialize (2-3 minutes)

### **1.2 Get Database Connection String**
1. In Supabase dashboard, go **"Settings"** → **"Database"**
2. Copy **Connection String** (under "URI")
3. It looks like: `postgresql://postgres:[PASSWORD]@db.xxx.supabase.co:5432/postgres`
4. **Replace `[PASSWORD]`** with your database password from Step 1.4

### **1.3 Update Connection String Format**
The connection string needs to be modified. Change:
```
postgresql://postgres:PASSWORD@db.xxx.supabase.co:5432/postgres
```
To:
```
postgresql://postgres:PASSWORD@db.xxx.supabase.co:5432/postgres?schema=public
```

**Copy this final connection string** - you'll need it in Step 2 for Render.

---

## **STEP 2: Deploy Backend to Render ✅**

### **2.1 Create Render Account**
1. Go to [render.com](https://render.com)
2. Sign up with GitHub
3. Authorize Render to access your repositories

### **2.2 Create New Web Service**
1. Click **"+ New"** → **"Web Service"**
2. Select your **Taskflow** repository
3. Configure:
   - **Name:** `taskflow-backend`
   - **Environment:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `node server.js`
   - **Root Directory:** `Backend`

### **2.3 Add Environment Variables**
1. Click **"Environment"** tab
2. Add these variables:
   ```
   NODE_ENV=production
   PORT=5000
   JWT_SECRET=your-super-secret-key-min-32-chars-make-it-random
   JWT_EXPIRY=7d
   DATABASE_URL=postgresql://postgres:PASSWORD@db.xxx.supabase.co:5432/postgres?schema=public
   REDIS_URL=your-upstash-redis-url-or-leave-empty-for-now
   FRONTEND_URL=https://taskflow-xxx.vercel.app
   ```

   **Important:** Replace:
   - `JWT_SECRET` with a random string (min 32 characters)
   - `DATABASE_URL` with your Supabase connection string from Step 1.3
   - `FRONTEND_URL` with your future Vercel frontend URL (we'll add this after deploying frontend)

### **2.4 Deploy Backend**
1. Click **"Deploy"**
2. Render builds your backend (2-3 minutes)
3. Wait for **"Your service is live"** message
4. **Copy your backend URL** (looks like: `https://taskflow-backend-xxxx.onrender.com`)

### **2.5 Run Database Migrations**
1. Go to your Render service → **"Shell"** tab
2. Run these commands:
   ```bash
   npx prisma migrate deploy
   npx prisma db seed
   ```
3. Wait for completion (migrations create tables)

---

## **STEP 3: Deploy Frontend to Vercel ✅**

### **3.1 Update Frontend API URL**
Before deploying, update your API URL:

Edit [Frontend/src/api/axios.js](Frontend/src/api/axios.js):
```javascript
const API_URL = process.env.VITE_API_URL || 'https://taskflow-backend-xxxx.onrender.com/api/v1';
```

**Replace with your actual Render backend URL from Step 2.4**

Commit and push:
```bash
git add Frontend/src/api/axios.js
git commit -m "Update API URL for Render backend"
git push origin main
```

### **3.2 Create Vercel Project**
1. Go to [vercel.com](https://vercel.com)
2. Click **"Add New"** → **"Project"**
3. **Import Git Repository** → Select **Taskflow**
4. Configure:
   - **Framework:** React
   - **Root Directory:** `Frontend`

### **3.3 Add Environment Variables (Vercel)**
1. Go to **Settings** → **Environment Variables**
2. Add:
   ```
   VITE_API_URL=https://taskflow-backend-xxxx.onrender.com/api/v1
   ```
   (Replace with your actual Render backend URL)

### **3.4 Deploy Frontend**
1. Click **"Deploy"**
2. Vercel builds (1-2 minutes)
3. **Copy your frontend URL** (looks like: `https://taskflow-xxx.vercel.app`)

---

## **STEP 4: Connect Frontend & Backend ✅**

### **4.1 Update Render FRONTEND_URL**
1. Go back to **Render** → Your backend service
2. Click **"Environment"**
3. Update `FRONTEND_URL` to your Vercel URL:
   ```
   FRONTEND_URL=https://taskflow-xxx.vercel.app
   ```
4. Click **"Save"** (service auto-redeploys)

### **4.2 Test Connection**
1. Open your **Vercel frontend URL**: `https://taskflow-xxx.vercel.app`
2. Try to **Register** a new account
3. If it works → Backend & Database connected! ✅

---

## **✅ Final URLs**

| Service | URL | Purpose |
|---------|-----|---------|
| **Backend (Render)** | `https://taskflow-backend-xxxx.onrender.com` | API server |
| **Frontend (Vercel)** | `https://taskflow-xxx.vercel.app` | React UI |
| **Database (Supabase)** | PostgreSQL cloud database | Data storage |
| **Swagger Docs** | `https://taskflow-backend-xxxx.onrender.com/api-docs` | API documentation |

---

## **🧪 Test Your Deployment**

### **1. Test Backend API**
```bash
# Replace with your Render backend URL
BACKEND_URL="https://taskflow-backend-xxxx.onrender.com"

# Test Register
curl -X POST $BACKEND_URL/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "Test@123"
  }'

# Test Login
curl -X POST $BACKEND_URL/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test@123"
  }'
```

### **2. Test Frontend**
1. Go to `https://taskflow-xxx.vercel.app`
2. Register with test credentials
3. Login and see dashboard
4. Try creating a task (if admin)

### **3. Test Swagger Docs**
1. Visit `https://taskflow-backend-xxxx.onrender.com/api-docs`
2. Try "Execute" on any endpoint
3. Should get responses

---

## **🔒 Security Checklist**

- [ ] JWT_SECRET is random & long (min 32 chars)
- [ ] DATABASE_URL not exposed in logs
- [ ] FRONTEND_URL matches your Vercel domain
- [ ] `.env` file NOT pushed to GitHub
- [ ] Supabase database password is strong
- [ ] CORS configured for your Vercel domain
- [ ] Swagger docs visible (optional: add password protection)

---

## **🚨 Troubleshooting**

### **Issue: Frontend can't connect to backend**
**Solution:**
1. Check `VITE_API_URL` in Vercel environment variables
2. Verify Render backend URL is correct
3. Go to Render backend → **Settings** → ensure `FRONTEND_URL` matches your Vercel domain
4. Rebuild frontend: In Vercel, go to **Deployments** → **Redeploy**

### **Issue: Database connection failed**
**Solution:**
1. Verify `DATABASE_URL` format is correct (includes `?schema=public`)
2. Check Supabase database password is correct
3. Ensure connection string has `[PASSWORD]` replaced with actual password
4. In Render shell, test connection:
   ```bash
   npx prisma db pull
   ```

### **Issue: Migrations not running**
**Solution:**
1. Go to Render service → **Shell**
2. Run:
   ```bash
   npx prisma migrate status
   npx prisma migrate deploy
   ```

### **Issue: "502 Bad Gateway" on Render**
**Solution:**
1. Check Render logs: Service → **Logs** tab
2. Look for database connection errors
3. Verify all environment variables are set
4. Restart service: Click **"Restart"** button

### **Issue: CORS errors in browser**
**Solution:**
Edit [Backend/src/app.js](Backend/src/app.js):
```javascript
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
```

---

## **📊 Monitor Your Deployment**

### **Render Dashboard**
- Service page shows real-time logs
- CPU, memory, bandwidth usage
- Restart service anytime

### **Vercel Dashboard**
- View build logs on each deployment
- See analytics & errors
- Redeploy previous versions

### **Supabase Dashboard**
- View database size
- Check user data in table editor
- Run SQL queries

---

## **🔄 Auto-Deployment on Git Push**

Both Render and Vercel auto-deploy when you push to GitHub:

```bash
# Make changes
git add .
git commit -m "Add new feature"
git push origin main

# Render backend auto-deploys in ~2 mins
# Vercel frontend auto-deploys in ~1 min
```

---

## **💡 Next Steps**

1. ✅ Setup Supabase database
2. ✅ Deploy backend to Render
3. ✅ Deploy frontend to Vercel
4. ✅ Test all endpoints
5. ✅ Share your deployed URLs with reviewer!

---

## **📚 Resources**

- **Render Docs:** https://docs.render.com
- **Vercel Docs:** https://vercel.com/docs
- **Supabase Docs:** https://supabase.com/docs
- **Prisma Docs:** https://www.prisma.io/docs
- **Railway vs Render vs Heroku:** Render has better free tier pricing!

---

## **🎯 Summary**

```
GitHub (Code)
    ↓
┌───────────────────────────────────┐
│ Render (Backend)                  │
│ - Express API                     │
│ - https://taskflow-backend.onrender.com
└─────────────┬─────────────────────┘
              │
              ↓ API Calls
┌───────────────────────────────────┐
│ Supabase (Database)               │
│ - PostgreSQL                      │
│ - Tables: User, Task             │
└───────────────────────────────────┘
              ↑ API Calls
              │
┌─────────────┴─────────────────────┐
│ Vercel (Frontend)                 │
│ - React App                       │
│ - https://taskflow-xxx.vercel.app│
└───────────────────────────────────┘
```

**Everything is connected and auto-deployed! 🎉**
