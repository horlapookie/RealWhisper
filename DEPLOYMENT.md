# Deployment Guide for "your hïghñëss" Chat App

## Render.com Deployment

### Prerequisites
1. Create a Render.com account
2. Set up a PostgreSQL database (Neon or Render's managed PostgreSQL)

### Step 1: Database Setup
1. Create a PostgreSQL database on Render or use Neon
2. Get your database connection string
3. Note: The app automatically creates tables on first run

### Step 2: Deploy Web Service
1. Connect your GitHub repository to Render
2. Create a new Web Service with these settings:

**Build & Deploy Settings:**
- **Build Command**: `npm install && npm run build`
- **Start Command**: `npm start`
- **Node Version**: 18 or higher

**Environment Variables:**
- `NODE_ENV`: `production`
- `DATABASE_URL`: Your PostgreSQL connection string

### Step 3: Configure Service
- **Plan**: Free tier is sufficient for testing
- **Region**: Choose closest to your users
- **Health Check Path**: `/` (optional)

### Common Issues & Solutions

#### 502 Gateway Error
This usually means the server isn't starting properly. Check:

1. **Port Binding**: The app listens on `process.env.PORT` (Render automatically sets this)
2. **Build Success**: Ensure the build command completed without errors
3. **Database Connection**: Verify your DATABASE_URL is correct
4. **Dependencies**: Make sure all packages are in package.json dependencies (not devDependencies)

#### Database Connection Issues
- Ensure your DATABASE_URL includes all connection parameters
- Check that your database allows external connections
- Verify the database exists and is accessible

#### Build Failures
- Check that all dependencies are properly listed
- Ensure your build script works locally first
- Verify Node.js version compatibility

### Testing Deployment
1. Check Render's deploy logs for any errors
2. Visit your app URL after deployment completes
3. Test user registration and login
4. Try sending messages to verify WebSocket connectivity

### Environment Variables Required
```
NODE_ENV=production
DATABASE_URL=postgresql://username:password@host:port/database
```

### Local Testing
Before deploying, test production mode locally:
```bash
npm run build
NODE_ENV=production DATABASE_URL=your_local_db_url npm start
```

This will help identify any issues before deployment.