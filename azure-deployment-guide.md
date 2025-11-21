# Azure Static Web Apps Deployment Guide for MWCI Tracker

## Prerequisites Checklist
- [x] Azure CLI installed (v2.74.0)
- [x] Logged in to Azure (`hussein.srour@thakralone.com`)
- [ ] GitHub repository set up
- [ ] Azure subscription active ("Azure subscription 1")

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────┐
│           Azure Static Web Apps (Frontend)          │
│   - React + TypeScript + Vite                      │
│   - Global CDN                                      │
│   - Custom domain: tracker.thakralone.com          │
│   - Free SSL certificate                           │
└─────────────────┬───────────────────────────────────┘
                  │
                  │ API Calls
                  ▼
┌─────────────────────────────────────────────────────┐
│        Firebase (Backend - Existing)                │
│   - Firestore (Database)                           │
│   - Authentication (Email + 2FA)                   │
│   - Cloud Functions (Email verification, cleanup)  │
└─────────────────────────────────────────────────────┘
```

**Key Point**: You keep your Firebase backend as-is. Only the frontend moves to Azure.

---

## Step-by-Step Deployment

### Step 1: Re-authenticate Azure CLI

```bash
# Your token expired, so login again
az login --scope https://management.core.windows.net//.default

# Verify login
az account show
```

### Step 2: Set Active Subscription

```bash
# List all subscriptions
az account list --output table

# Set to your paid subscription
az account set --subscription "Azure subscription 1"

# Verify it's set
az account show --query "{Name:name, ID:id, IsDefault:isDefault}"
```

### Step 3: Install Azure Static Web Apps CLI Extension

```bash
# Install the extension
az extension add --name staticwebapp

# Or update if already installed
az extension update --name staticwebapp
```

### Step 4: Create Resource Group

```bash
# Create resource group in Southeast Asia (closest to Philippines/Manila)
az group create \
  --name mwci-tracker-rg \
  --location southeastasia \
  --tags Environment=Production Project=MWCI-Tracker Owner=Hussein Company=Thakralone

# Verify creation
az group list --output table
```

### Step 5: Build Your Application Locally (Test)

```bash
# Navigate to project
cd /Users/husseinsrour/Downloads/MWCI_tracker

# Install dependencies (if not already)
npm install

# Test build
npm run build

# Verify dist folder was created
ls -la dist/
```

### Step 6: Create Static Web App Resource

```bash
# Create the Static Web App
az staticwebapp create \
  --name mwci-tracker \
  --resource-group mwci-tracker-rg \
  --location southeastasia \
  --sku Standard \
  --tags Environment=Production Project=MWCI-Tracker

# This will output a deployment token - SAVE IT!
# The token looks like: xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

**Important**: Save the deployment token! You'll need it for GitHub Actions.

### Step 7: Set Up GitHub Repository (If Not Already Done)

```bash
# Check if git is initialized
git status

# Check remote
git remote -v

# If no remote, create a GitHub repo first at github.com
# Then add remote:
git remote add origin https://github.com/YOUR_USERNAME/mwci-tracker.git

# Push code
git add .
git commit -m "Prepare for Azure deployment"
git push -u origin main
```

### Step 8: Configure GitHub Actions for Auto-Deployment

Create a GitHub Actions workflow file:

```bash
# Create .github/workflows directory
mkdir -p .github/workflows

# The workflow file will be created in the next step
```

Create file `.github/workflows/azure-static-web-apps.yml`:

```yaml
name: Azure Static Web Apps CI/CD

on:
  push:
    branches:
      - main
  pull_request:
    types: [opened, synchronize, reopened, closed]
    branches:
      - main

jobs:
  build_and_deploy_job:
    if: github.event_name == 'push' || (github.event_name == 'pull_request' && github.event.action != 'closed')
    runs-on: ubuntu-latest
    name: Build and Deploy Job
    steps:
      - uses: actions/checkout@v3
        with:
          submodules: true
          lfs: false

      - name: Build And Deploy
        id: builddeploy
        uses: Azure/static-web-apps-deploy@v1
        with:
          azure_static_web_apps_api_token: ${{ secrets.AZURE_STATIC_WEB_APPS_API_TOKEN }}
          repo_token: ${{ secrets.GITHUB_TOKEN }}
          action: "upload"
          app_location: "/" # App source code path
          api_location: "" # Api source code path - optional (we use Firebase)
          output_location: "dist" # Built app content directory

  close_pull_request_job:
    if: github.event_name == 'pull_request' && github.event.action == 'closed'
    runs-on: ubuntu-latest
    name: Close Pull Request Job
    steps:
      - name: Close Pull Request
        id: closepullrequest
        uses: Azure/static-web-apps-deploy@v1
        with:
          azure_static_web_apps_api_token: ${{ secrets.AZURE_STATIC_WEB_APPS_API_TOKEN }}
          action: "close"
```

### Step 9: Add Deployment Token to GitHub Secrets

1. Go to your GitHub repository
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Name: `AZURE_STATIC_WEB_APPS_API_TOKEN`
5. Value: Paste the deployment token from Step 6
6. Click **Add secret**

### Step 10: Add Environment Variables to Azure

You need to add your Firebase configuration as environment variables:

```bash
# Add environment variables one by one
az staticwebapp appsettings set \
  --name mwci-tracker \
  --resource-group mwci-tracker-rg \
  --setting-names \
    VITE_FIREBASE_API_KEY="AIzaSyBvaCmpIjqUsJBAFEie7GeTirFy-konSFk" \
    VITE_FIREBASE_AUTH_DOMAIN="mwci-tracker.firebaseapp.com" \
    VITE_FIREBASE_PROJECT_ID="mwci-tracker" \
    VITE_FIREBASE_STORAGE_BUCKET="mwci-tracker.firebasestorage.app" \
    VITE_FIREBASE_MESSAGING_SENDER_ID="149059145187" \
    VITE_FIREBASE_APP_ID="1:149059145187:web:8604ee5d9bab4ae571e4d6"

# Verify settings
az staticwebapp appsettings list \
  --name mwci-tracker \
  --resource-group mwci-tracker-rg
```

**Important**: These are build-time environment variables for Vite. They'll be injected during the build process.

### Step 11: Push to GitHub and Deploy

```bash
# Add the workflow file
git add .github/workflows/azure-static-web-apps.yml
git commit -m "Add Azure Static Web Apps CI/CD workflow"
git push origin main

# GitHub Actions will automatically:
# 1. Build your React app
# 2. Deploy to Azure Static Web Apps
# 3. Provide a URL
```

### Step 12: Get Your App URL

```bash
# Get the default hostname
az staticwebapp show \
  --name mwci-tracker \
  --resource-group mwci-tracker-rg \
  --query "defaultHostname" \
  --output tsv

# This will output something like:
# mwci-tracker.azurestaticapps.net
```

Visit the URL to see your deployed app!

---

## Custom Domain Setup (tracker.thakralone.com)

### Step 1: Add Custom Domain in Azure

```bash
# Add custom domain
az staticwebapp hostname set \
  --name mwci-tracker \
  --resource-group mwci-tracker-rg \
  --hostname tracker.thakralone.com
```

### Step 2: Get DNS Validation Record

```bash
# Get the TXT record for validation
az staticwebapp hostname show \
  --name mwci-tracker \
  --resource-group mwci-tracker-rg \
  --hostname tracker.thakralone.com
```

### Step 3: Add DNS Records

Add these records to your DNS provider (GoDaddy, Cloudflare, etc.):

**CNAME Record**:
- **Type**: CNAME
- **Name**: tracker
- **Value**: mwci-tracker.azurestaticapps.net
- **TTL**: 3600

**TXT Record** (for validation):
- **Type**: TXT
- **Name**: _dnsauth.tracker
- **Value**: (the validation code from Step 2)
- **TTL**: 3600

### Step 4: Validate Domain

Wait 5-10 minutes for DNS propagation, then:

```bash
# Check validation status
az staticwebapp hostname show \
  --name mwci-tracker \
  --resource-group mwci-tracker-rg \
  --hostname tracker.thakralone.com

# Azure will automatically provision a free SSL certificate!
```

---

## Firebase Configuration Update

You might need to add your Azure domain to Firebase authorized domains:

1. Go to Firebase Console: https://console.firebase.google.com/project/mwci-tracker
2. Click **Authentication** → **Settings** → **Authorized domains**
3. Add:
   - `mwci-tracker.azurestaticapps.net`
   - `tracker.thakralone.com` (if using custom domain)
4. Click **Add**

---

## Monitoring and Management

### View Deployment Logs

```bash
# List recent deployments
az staticwebapp show \
  --name mwci-tracker \
  --resource-group mwci-tracker-rg \
  --query "{Name:name, DefaultHostname:defaultHostname, Location:location}"
```

### View in Azure Portal

1. Go to https://portal.azure.com
2. Navigate to **Resource groups** → **mwci-tracker-rg**
3. Click on **mwci-tracker** Static Web App
4. You can see:
   - **Overview**: Deployment status, URL, etc.
   - **Environments**: Production and preview URLs
   - **Functions**: (N/A - you use Firebase)
   - **Configuration**: Environment variables
   - **Custom domains**: Manage domains and SSL
   - **Monitoring**: Traffic, performance metrics

### View GitHub Actions Logs

1. Go to your GitHub repository
2. Click **Actions** tab
3. Click on the latest workflow run
4. View build and deployment logs

---

## Cost Estimation

### Azure Static Web Apps Pricing:

**Free Tier**:
- ❌ No custom domains
- ❌ Limited bandwidth (100 GB/month)
- ❌ Limited API calls

**Standard Tier** (Recommended):
- ✅ **Cost**: ~$9 USD/month
- ✅ Custom domains + free SSL
- ✅ 100 GB bandwidth/month (then $0.20/GB)
- ✅ Unlimited API calls (you use Firebase anyway)
- ✅ Staging environments
- ✅ Private endpoints support

**Your estimated monthly cost**: $9-15 USD (depending on traffic)

### Firebase Costs:
- **Current plan**: Likely Blaze (Pay as you go)
- **Estimated cost**: $0-10/month for small team usage
- No change needed - stays the same

**Total monthly cost**: ~$9-25 USD

---

## Scaling and Performance

### Global CDN
Azure Static Web Apps automatically distributes your app to Microsoft's global CDN:
- **Southeast Asia** (Singapore) - Primary region
- **Edge locations worldwide** - Cached content for faster access

### Performance Optimization
Your current setup is already optimized:
- ✅ Vite builds optimized production bundles
- ✅ Code splitting enabled
- ✅ Lazy loading with React Router
- ✅ Tailwind CSS purging unused styles
- ✅ Firebase SDK tree-shaking

No changes needed!

---

## Security Considerations

### Environment Variables Security
✅ **Secure**: Environment variables are injected at build time
✅ **Not exposed**: Only included in compiled JavaScript (safe for Firebase public config)
✅ **Firebase rules**: Already have Firestore security rules protecting data

### HTTPS/SSL
✅ **Automatic**: Azure provides free SSL certificates
✅ **Auto-renewal**: Certificates automatically renewed
✅ **HSTS**: HTTP Strict Transport Security enabled

### Authentication
✅ **Firebase Auth**: Continues working as-is
✅ **Email verification**: Already implemented
✅ **2FA**: Already implemented
✅ **Domain restriction**: `@thakralone.com` and `@manilawater.com` only

---

## Rollback and Recovery

### Rollback to Previous Deployment

GitHub Actions automatically creates deployment history:

```bash
# View deployment history in Azure Portal
# Go to Environments → View all deployments
# Click "Promote to production" on any previous deployment
```

Or via Git:
```bash
# Revert to previous commit
git revert HEAD
git push origin main

# GitHub Actions will auto-deploy the reverted version
```

---

## Team Access and Collaboration

### Add Team Members to Azure

```bash
# Add a team member as Contributor
az role assignment create \
  --assignee "email@thakralone.com" \
  --role "Contributor" \
  --resource-group mwci-tracker-rg

# Add as Reader (view-only)
az role assignment create \
  --assignee "email@thakralone.com" \
  --role "Reader" \
  --resource-group mwci-tracker-rg
```

### Available Roles:
- **Owner**: Full control (assign roles, delete resources)
- **Contributor**: Deploy, manage, but can't assign roles
- **Reader**: View-only access
- **Static Web App Contributor**: Manage Static Web Apps only

---

## Troubleshooting

### Issue: Build Fails in GitHub Actions

**Check**:
1. View GitHub Actions logs: Repo → Actions → Click failed run
2. Common issues:
   - Missing environment variables
   - TypeScript errors
   - Missing dependencies

**Solution**:
```bash
# Test build locally first
npm run build

# If it works locally, check GitHub secrets are set correctly
```

### Issue: Environment Variables Not Working

**Check**:
```bash
# Verify environment variables are set
az staticwebapp appsettings list \
  --name mwci-tracker \
  --resource-group mwci-tracker-rg
```

**Solution**: Re-add environment variables (see Step 10)

### Issue: Custom Domain Not Working

**Check DNS propagation**:
```bash
# Check CNAME record
dig tracker.thakralone.com CNAME

# Check TXT record
dig _dnsauth.tracker.thakralone.com TXT
```

**Solution**: Wait up to 24 hours for DNS propagation. Most take 5-15 minutes.

### Issue: Firebase Authentication Errors

**Solution**: Add Azure domain to Firebase authorized domains:
1. Firebase Console → Authentication → Settings → Authorized domains
2. Add your Azure URL

---

## Maintenance Checklist

### Weekly:
- [ ] Check GitHub Actions for failed deployments
- [ ] Monitor Azure costs in Cost Management

### Monthly:
- [ ] Review Azure Static Web Apps metrics (traffic, bandwidth)
- [ ] Check Firebase usage and costs
- [ ] Update dependencies: `npm update`
- [ ] Review and clean up old staging environments

### Quarterly:
- [ ] Review security: Update Firebase rules if needed
- [ ] Update Azure CLI: `az upgrade`
- [ ] Review team access permissions

---

## Next Steps After Deployment

1. **Test the deployed app**:
   - Visit your Azure URL
   - Test login with admin account
   - Test all features (KPI Tracker, Deliverables, etc.)
   - Test on mobile devices

2. **Share with your team**:
   - Send the URL to your company
   - Create user accounts for team members
   - Train team on using the system

3. **Set up monitoring**:
   - Enable Application Insights (optional, ~$5/month)
   - Set up alerts for downtime
   - Monitor Firebase usage

4. **Documentation**:
   - Update README.md with new Azure URL
   - Document deployment process for team
   - Create user guide for non-technical users

---

## Support and Resources

### Azure Documentation:
- **Static Web Apps**: https://docs.microsoft.com/azure/static-web-apps/
- **Custom Domains**: https://docs.microsoft.com/azure/static-web-apps/custom-domain
- **Environment Variables**: https://docs.microsoft.com/azure/static-web-apps/application-settings

### Firebase Documentation:
- **Firebase Console**: https://console.firebase.google.com/project/mwci-tracker
- **Authorized Domains**: https://firebase.google.com/docs/auth/web/redirect-best-practices

### Contact:
- **Azure Support**: Available in Azure Portal → Help + support
- **GitHub Actions**: View logs in repository Actions tab
- **Project Owner**: hussein.srour@thakralone.com

---

## Quick Command Reference

```bash
# Login to Azure
az login --scope https://management.core.windows.net//.default

# Set subscription
az account set --subscription "Azure subscription 1"

# Create resource group
az group create --name mwci-tracker-rg --location southeastasia

# Create Static Web App
az staticwebapp create --name mwci-tracker --resource-group mwci-tracker-rg --location southeastasia

# Add environment variables
az staticwebapp appsettings set --name mwci-tracker --resource-group mwci-tracker-rg --setting-names KEY=VALUE

# Get app URL
az staticwebapp show --name mwci-tracker --resource-group mwci-tracker-rg --query "defaultHostname"

# Add custom domain
az staticwebapp hostname set --name mwci-tracker --resource-group mwci-tracker-rg --hostname tracker.thakralone.com

# Build locally
npm run build

# Deploy (happens automatically via GitHub Actions)
git push origin main
```

---

## Conclusion

You now have a professional, scalable, and cost-effective hosting solution for your MWCI Tracker on Azure! The setup provides:

✅ Global CDN for fast access worldwide
✅ Automatic HTTPS/SSL
✅ Custom domain support
✅ CI/CD with GitHub Actions
✅ No server management
✅ Cost-effective (~$9-15/month)
✅ Seamless integration with existing Firebase backend

**Estimated setup time**: 30-45 minutes
**Deployment time**: 3-5 minutes per push to GitHub

Good luck with your deployment! 🚀
