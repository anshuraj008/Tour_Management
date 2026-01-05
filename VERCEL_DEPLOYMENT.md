# Vercel Deployment Guide

## Backend Deployment

1. **Install Vercel CLI** (if not already installed):
   ```bash
   npm install -g vercel
   ```

2. **Navigate to backend folder**:
   ```bash
   cd backend
   ```

3. **Deploy to Vercel**:
   ```bash
   vercel
   ```

4. **Set Environment Variables** (in Vercel Dashboard):
   - Go to your project settings on Vercel
   - Navigate to "Environment Variables"
   - Add the following:
     - `MONGO_URL` = your MongoDB connection string
     - `JWT_SECRET_KEY` = your JWT secret key
     - `NODE_ENV` = production

5. **Redeploy** after setting environment variables:
   ```bash
   vercel --prod
   ```

6. **Copy your backend URL** (e.g., `https://your-backend.vercel.app`)

## Frontend Deployment

1. **Navigate to frontend folder**:
   ```bash
   cd frontend
   ```

2. **Update .env file** with your deployed backend URL:
   ```
   REACT_APP_BACKEND_URL=https://your-backend.vercel.app/api/v1
   ```

3. **Deploy to Vercel**:
   ```bash
   vercel
   ```

4. **Deploy to production**:
   ```bash
   vercel --prod
   ```

## Important Notes

- Deploy **backend first**, then **frontend**
- Update frontend's `REACT_APP_BACKEND_URL` with the deployed backend URL
- Make sure to add environment variables in Vercel Dashboard for backend
- Both projects will have separate Vercel URLs
- You can also connect your GitHub repo for automatic deployments

## CORS Configuration

Your backend already has CORS enabled with `origin: true` which allows all origins. For production, you might want to restrict this to your frontend URL only.

In `backend/index.js`, update:
```javascript
const corsOptions = {
	origin: 'https://your-frontend.vercel.app',
	credentials: true
}
```
