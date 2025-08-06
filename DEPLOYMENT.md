# Deployment Guide for MLOps Experiment Tracker

## GitHub Pages Deployment

This project is configured for automatic deployment to GitHub Pages using GitHub Actions.

### 🚀 Quick Deployment Steps

1. **Push to Repository**

   ```bash
   git add .
   git commit -m "Deploy to GitHub Pages"
   git push origin develop
   ```

2. **Enable GitHub Pages**

   - Go to your GitHub repository
   - Navigate to **Settings** → **Pages**
   - Under "Source", select **GitHub Actions**
   - Save the settings

3. **Monitor Deployment**
   - Go to **Actions** tab in your GitHub repository
   - Watch the "Deploy to GitHub Pages" workflow
   - Once completed, your app will be live at:
     `https://maksym-kostetskyi.github.io/ml-test-task`

### 🔧 Manual Deployment (Alternative)

If you prefer manual deployment:

```bash
# Install dependencies (if not done already)
npm install

# Build the project
npm run build

# Deploy to GitHub Pages
npm run deploy
```

### ⚙️ Configuration Details

- **Base URL**: `/ml-test-task/` (configured in `vite.config.ts`)
- **Build Output**: `dist/` folder
- **GitHub Pages Branch**: Managed automatically by GitHub Actions
- **Deployment Triggers**: Push to `main`, `master`, or `develop` branches

### 🌐 Live URL

Once deployed, your application will be available at:
**https://maksym-kostetskyi.github.io/ml-test-task**

### 🔍 Troubleshooting

**Issue**: 404 errors on refresh

- **Solution**: GitHub Pages serves static files, single-page routing is handled by React

**Issue**: Assets not loading

- **Solution**: Check that `base: '/ml-test-task/'` is set in `vite.config.ts`

**Issue**: Workflow fails

- **Solution**: Ensure repository has GitHub Pages enabled and source is set to "GitHub Actions"

### 📱 Testing

1. Test locally: `npm run build && npm run preview`
2. Test deployment: Push to repository and check GitHub Actions
3. Verify live site: Visit the GitHub Pages URL

### 🔄 Automatic Updates

Every push to `develop`, `main`, or `master` will:

1. Trigger GitHub Actions workflow
2. Build the application
3. Deploy to GitHub Pages automatically
4. Update the live site within 1-2 minutes
