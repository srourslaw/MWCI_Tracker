# Complete Azure Migration Guide - Move EVERYTHING to Azure

**Goal**: Migrate from personal accounts (GitHub, Vercel, Firebase) to 100% Azure-owned infrastructure

**Timeline**: 2-3 weeks (part-time)
**Cost**: ~$52/month (vs $201/month VM proposal = 74% savings)

---

## 📋 What We're Replacing

| Current (Personal) | New (Azure) | Reason |
|-------------------|-------------|---------|
| **GitHub** (personal) | **Azure DevOps Repos** | Company-owned code |
| **GitHub Actions** | **Azure Pipelines** | Company-owned CI/CD |
| **Vercel** | **Azure Static Web Apps** | Company-owned hosting |
| **Firebase Firestore** | **Azure Cosmos DB** | Company-owned database |
| **Firebase Auth** | **Azure AD B2C** | Company SSO integration |
| **Firebase Storage** | **Azure Blob Storage** | Company-owned files |
| **Firebase Functions** | **Azure Functions** | Company-owned backend |

**Result**: 100% of infrastructure on company's Azure subscription ✅

---

## 💰 Cost Breakdown (Monthly)

```
Azure DevOps (Basic Plan)          FREE (up to 5 users)
Azure Static Web Apps (Standard)   $9.00
Azure Cosmos DB (Serverless)        $25-35.00
Azure Functions (Consumption)       $0-15.00
Azure Blob Storage                  $2-5.00
Azure AD B2C                        FREE (up to 50k users)
Application Insights                $0-5.00
────────────────────────────────────────────────
TOTAL:                              $46-69/month (avg $52)
```

**vs VM Proposal**: $201/month
**Savings**: $149/month = $1,788/year = **74% cost reduction**

---

## 🚀 PHASE 1: Set Up Azure DevOps (Company Code Repository)

**Timeline**: Day 1 (2-3 hours)
**Replaces**: GitHub personal account

### Step 1.1: Create Azure DevOps Organization

```bash
# Via Azure Portal:

1. Go to https://dev.azure.com

2. Click "Start free" or "Sign in"

3. Sign in with your Azure account (hussein.srour@thakralone.com)

4. Create new organization:
   - Name: "thakralone" (or your company name)
   - Region: "Southeast Asia" (or closest to your location)
   - Click "Continue"

5. Create project:
   - Name: "MWCI_Tracker"
   - Visibility: "Private"
   - Work item process: "Agile"
   - Version control: "Git"
   - Click "Create project"
```

**Result**: https://dev.azure.com/thakralone/MWCI_Tracker

### Step 1.2: Clone Your Current GitHub Repo Locally

```bash
# Navigate to your project
cd /Users/husseinsrour/Downloads/MWCI_tracker

# Verify it's a git repository
git status

# You should see:
# On branch main
# Your branch is up to date with 'origin/main'.
```

### Step 1.3: Add Azure DevOps as New Remote

```bash
# Get Azure DevOps repo URL
# Go to: https://dev.azure.com/thakralone/MWCI_Tracker/_git/MWCI_Tracker
# Click "Clone" → Copy HTTPS URL

# Add Azure DevOps as new remote
git remote add azure https://thakralone@dev.azure.com/thakralone/MWCI_Tracker/_git/MWCI_Tracker

# Verify remotes
git remote -v

# You should see:
# origin  https://github.com/srourslaw/MWCI_Tracker.git (fetch)
# origin  https://github.com/srourslaw/MWCI_Tracker.git (push)
# azure   https://thakralone@dev.azure.com/thakralone/MWCI_Tracker/_git/MWCI_Tracker (fetch)
# azure   https://thakralone@dev.azure.com/thakralone/MWCI_Tracker/_git/MWCI_Tracker (push)
```

### Step 1.4: Push Code to Azure DevOps

```bash
# Push all branches to Azure DevOps
git push azure --all

# Push tags
git push azure --tags

# If prompted for credentials:
# - Username: (leave empty or use your email)
# - Password: Use Personal Access Token (PAT)

# To create PAT:
# 1. Go to https://dev.azure.com/thakralone/_usersSettings/tokens
# 2. Click "New Token"
# 3. Name: "Git Operations"
# 4. Expiration: 1 year
# 5. Scopes: "Full access"
# 6. Click "Create"
# 7. Copy token and save it somewhere safe!
```

### Step 1.5: Set Azure DevOps as Default Remote

```bash
# Set azure as default remote
git remote rename origin github-backup
git remote rename azure origin

# Verify
git remote -v

# Should now see:
# github-backup  https://github.com/srourslaw/MWCI_Tracker.git (fetch)
# github-backup  https://github.com/srourslaw/MWCI_Tracker.git (push)
# origin         https://thakralone@dev.azure.com/thakralone/MWCI_Tracker/_git/MWCI_Tracker (fetch)
# origin         https://thakralone@dev.azure.com/thakralone/MWCI_Tracker/_git/MWCI_Tracker (push)
```

**✅ Checkpoint**: Code is now on Azure DevOps! View at https://dev.azure.com/thakralone/MWCI_Tracker/_git/MWCI_Tracker

---

## 🚀 PHASE 2: Create Azure Resources

**Timeline**: Day 2 (3-4 hours)
**Creates**: All Azure infrastructure

### Step 2.1: Authenticate Azure CLI

```bash
# Login to Azure
az login --scope https://management.core.windows.net//.default

# Set your subscription
az account set --subscription "Azure subscription 1"

# Verify
az account show
```

### Step 2.2: Create Resource Group

```bash
# Create resource group in Southeast Asia
az group create \
  --name mwci-tracker-rg \
  --location southeastasia \
  --tags \
    Environment=Production \
    Project=MWCI-Tracker \
    Owner=Hussein \
    Company=Thakralone \
    ManagedBy=DevOps

# Verify
az group show --name mwci-tracker-rg --output table
```

### Step 2.3: Create Azure Cosmos DB (Replaces Firestore)

```bash
# Create Cosmos DB account with MongoDB API
az cosmosdb create \
  --name mwci-tracker-db \
  --resource-group mwci-tracker-rg \
  --kind MongoDB \
  --server-version 4.2 \
  --capabilities EnableServerless \
  --locations regionName=southeastasia failoverPriority=0 \
  --backup-policy-type Continuous \
  --default-consistency-level Session

# This takes 5-10 minutes. Wait for completion.

# Create database
az cosmosdb mongodb database create \
  --account-name mwci-tracker-db \
  --resource-group mwci-tracker-rg \
  --name mwci-tracker

# Create collections
az cosmosdb mongodb collection create \
  --account-name mwci-tracker-db \
  --resource-group mwci-tracker-rg \
  --database-name mwci-tracker \
  --name users

az cosmosdb mongodb collection create \
  --account-name mwci-tracker-db \
  --resource-group mwci-tracker-rg \
  --database-name mwci-tracker \
  --name tasks

az cosmosdb mongodb collection create \
  --account-name mwci-tracker-db \
  --resource-group mwci-tracker-rg \
  --database-name mwci-tracker \
  --name kpis

az cosmosdb mongodb collection create \
  --account-name mwci-tracker-db \
  --resource-group mwci-tracker-rg \
  --database-name mwci-tracker \
  --name deliverables

az cosmosdb mongodb collection create \
  --account-name mwci-tracker-db \
  --resource-group mwci-tracker-rg \
  --database-name mwci-tracker \
  --name auditLogs

az cosmosdb mongodb collection create \
  --account-name mwci-tracker-db \
  --resource-group mwci-tracker-rg \
  --database-name mwci-tracker \
  --name columnPermissions

# Get connection string (save this!)
az cosmosdb keys list \
  --name mwci-tracker-db \
  --resource-group mwci-tracker-rg \
  --type connection-strings \
  --query "connectionStrings[0].connectionString" \
  --output tsv

# Save the connection string - you'll need it later!
```

### Step 2.4: Create Azure Blob Storage (Replaces Firebase Storage)

```bash
# Create storage account
az storage account create \
  --name mwcitrackerstorage \
  --resource-group mwci-tracker-rg \
  --location southeastasia \
  --sku Standard_LRS \
  --kind StorageV2 \
  --access-tier Hot \
  --allow-blob-public-access false \
  --https-only true \
  --min-tls-version TLS1_2

# Create container for uploaded files
az storage container create \
  --name uploads \
  --account-name mwcitrackerstorage \
  --auth-mode login

# Get connection string
az storage account show-connection-string \
  --name mwcitrackerstorage \
  --resource-group mwci-tracker-rg \
  --query "connectionString" \
  --output tsv

# Save this connection string!
```

### Step 2.5: Create Azure AD B2C Tenant (Replaces Firebase Auth)

```bash
# Note: Azure AD B2C requires manual setup via Portal
# This cannot be done via CLI due to tenant creation restrictions

# Via Azure Portal:

1. Go to https://portal.azure.com

2. Search for "Azure AD B2C"

3. Click "Create"

4. Select "Create a new Azure AD B2C Tenant"

5. Fill in details:
   - Organization name: "Thakralone MWCI"
   - Initial domain name: "thakralonemwci"
   - Country/Region: "Philippines" (or your country)
   - Subscription: "Azure subscription 1"
   - Resource group: "mwci-tracker-rg"

6. Click "Review + create" → "Create"

7. Wait 2-3 minutes for tenant creation

8. Click "Link to subscription" if prompted

# Result: Tenant created at thakralonemwci.b2clogin.com
```

### Step 2.6: Configure Azure AD B2C

```bash
# Via Azure Portal (continue from previous step):

1. Click "Azure AD B2C" in the top menu bar

2. Register application:
   - Click "App registrations" → "New registration"
   - Name: "MWCI Tracker Web App"
   - Supported account types: "Accounts in any identity provider or organizational directory"
   - Redirect URI:
     - Platform: "Single-page application (SPA)"
     - URI: "http://localhost:5173"
   - Click "Register"

3. Note the "Application (client) ID" - save this!

4. Add additional redirect URIs:
   - Click "Authentication"
   - Add URIs:
     - https://mwci-tracker.azurestaticapps.net
     - https://tracker.thakralone.com (your custom domain)
   - Enable "Access tokens"
   - Enable "ID tokens"
   - Click "Save"

5. Create User Flow (Sign up and sign in):
   - Click "User flows" → "New user flow"
   - Select "Sign up and sign in" → "Recommended"
   - Name: "signupsignin"
   - Identity providers:
     - ✓ Email signup
   - User attributes and claims:
     - Collect: Email Address, Display Name
     - Return: Email Addresses, Display Name, User's Object ID
   - Click "Create"

6. Create User Flow (Password reset):
   - Click "New user flow"
   - Select "Password reset" → "Recommended"
   - Name: "passwordreset"
   - Identity providers:
     - ✓ Reset password using email address
   - Click "Create"

7. Customize branding (optional):
   - Click "Company branding"
   - Upload logo
   - Set colors
```

### Step 2.7: Create Azure Functions App (Replaces Firebase Functions)

```bash
# Create storage account for functions (required)
az storage account create \
  --name mwcifunctionsstorage \
  --resource-group mwci-tracker-rg \
  --location southeastasia \
  --sku Standard_LRS

# Create Function App
az functionapp create \
  --name mwci-tracker-functions \
  --resource-group mwci-tracker-rg \
  --storage-account mwcifunctionsstorage \
  --consumption-plan-location southeastasia \
  --runtime node \
  --runtime-version 18 \
  --functions-version 4 \
  --os-type Linux

# Enable Application Insights
az monitor app-insights component create \
  --app mwci-tracker-insights \
  --location southeastasia \
  --resource-group mwci-tracker-rg \
  --application-type web

# Link Application Insights to Function App
APPINSIGHTS_KEY=$(az monitor app-insights component show \
  --app mwci-tracker-insights \
  --resource-group mwci-tracker-rg \
  --query "instrumentationKey" \
  --output tsv)

az functionapp config appsettings set \
  --name mwci-tracker-functions \
  --resource-group mwci-tracker-rg \
  --settings "APPINSIGHTS_INSTRUMENTATIONKEY=$APPINSIGHTS_KEY"
```

### Step 2.8: Create Azure Static Web App (Replaces Vercel)

```bash
# Create Static Web App
az staticwebapp create \
  --name mwci-tracker \
  --resource-group mwci-tracker-rg \
  --location southeastasia \
  --sku Standard \
  --source https://dev.azure.com/thakralone/MWCI_Tracker/_git/MWCI_Tracker \
  --branch main \
  --app-location "/" \
  --output-location "dist" \
  --login-with-azure-devops

# Get deployment token
az staticwebapp secrets list \
  --name mwci-tracker \
  --resource-group mwci-tracker-rg \
  --query "properties.apiKey" \
  --output tsv

# Save this deployment token!

# Get default hostname
az staticwebapp show \
  --name mwci-tracker \
  --resource-group mwci-tracker-rg \
  --query "defaultHostname" \
  --output tsv

# Result: mwci-tracker.azurestaticapps.net
```

**✅ Checkpoint**: All Azure resources created!

### Step 2.9: Save All Connection Strings and Keys

Create a secure note/file with all these values:

```bash
# Cosmos DB
COSMOS_CONNECTION_STRING="mongodb://mwci-tracker-db:..."

# Blob Storage
STORAGE_CONNECTION_STRING="DefaultEndpointsProtocol=https;AccountName=mwcitrackerstorage;..."

# Azure AD B2C
B2C_TENANT_NAME="thakralonemwci"
B2C_CLIENT_ID="<your-client-id>"
B2C_AUTHORITY="https://thakralonemwci.b2clogin.com/thakralonemwci.onmicrosoft.com"

# Functions
FUNCTIONS_URL="https://mwci-tracker-functions.azurewebsites.net"

# Static Web App
STATIC_WEB_APP_URL="https://mwci-tracker.azurestaticapps.net"
DEPLOYMENT_TOKEN="<your-deployment-token>"

# Application Insights
APPINSIGHTS_INSTRUMENTATION_KEY="<your-key>"
```

---

## 🚀 PHASE 3: Set Up Azure Pipelines (CI/CD)

**Timeline**: Day 3 (2-3 hours)
**Replaces**: GitHub Actions, Vercel auto-deploy

### Step 3.1: Create Azure Pipeline for Static Web App

```bash
# Via Azure DevOps:

1. Go to https://dev.azure.com/thakralone/MWCI_Tracker

2. Click "Pipelines" → "Create Pipeline"

3. Select "Azure Repos Git"

4. Select repository: "MWCI_Tracker"

5. Select "Starter pipeline"

6. Replace content with this:
```

Create `azure-pipelines.yml` in your project root:

```yaml
trigger:
  - main

pool:
  vmImage: 'ubuntu-latest'

variables:
  - name: STATIC_WEB_APP_TOKEN
    value: '<your-deployment-token-from-step-2.8>'

steps:
  - task: NodeTool@0
    inputs:
      versionSpec: '18.x'
    displayName: 'Install Node.js'

  - script: |
      npm ci
    displayName: 'Install dependencies'

  - script: |
      npm run build
    displayName: 'Build application'

  - task: AzureStaticWebApp@0
    inputs:
      app_location: '/'
      output_location: 'dist'
      azure_static_web_apps_api_token: $(STATIC_WEB_APP_TOKEN)
    displayName: 'Deploy to Azure Static Web App'
```

### Step 3.2: Add Pipeline Variable

```bash
# In Azure DevOps:

1. Click "Pipelines" → Select your pipeline

2. Click "Edit"

3. Click "Variables" (top right)

4. Click "New variable"
   - Name: STATIC_WEB_APP_TOKEN
   - Value: <your-deployment-token>
   - Keep this value secret: ✓
   - Click "OK"

5. Click "Save"

6. Commit the azure-pipelines.yml file
```

### Step 3.3: Test Pipeline

```bash
# In your local project:

# Create and push azure-pipelines.yml
git add azure-pipelines.yml
git commit -m "ci: Add Azure Pipelines configuration for automated deployment"
git push origin main

# This will trigger the pipeline!

# Watch the build:
# Go to: https://dev.azure.com/thakralone/MWCI_Tracker/_build
# You should see a build running
# Wait for it to complete (3-5 minutes)
```

**✅ Checkpoint**: CI/CD is working! Every push to `main` now auto-deploys to Azure Static Web Apps.

---

## 🚀 PHASE 4: Migrate Data from Firebase to Cosmos DB

**Timeline**: Day 4-5 (4-6 hours)
**Migrates**: All Firestore data to Cosmos DB

### Step 4.1: Export Data from Firebase

```bash
# Install Firebase tools
npm install -g firebase-tools

# Login to Firebase
firebase login

# Set project
firebase use mwci-tracker

# Export Firestore data
firebase firestore:export ./firebase-export

# This creates a folder with all your Firestore data
ls -la firebase-export/
```

### Step 4.2: Create Migration Script

Create `migrate-to-cosmos.js`:

```javascript
const { MongoClient } = require('mongodb');
const fs = require('fs');
const path = require('path');

// Get connection string from command line or environment
const connectionString = process.env.COSMOS_CONNECTION_STRING || process.argv[2];

if (!connectionString) {
  console.error('Usage: node migrate-to-cosmos.js <connection-string>');
  process.exit(1);
}

async function migrate() {
  const client = new MongoClient(connectionString);

  try {
    await client.connect();
    console.log('✅ Connected to Cosmos DB');

    const db = client.db('mwci-tracker');

    // Read Firebase export
    const exportPath = './firebase-export';
    const collections = ['users', 'tasks', 'kpis', 'deliverables', 'auditLogs', 'columnPermissions'];

    for (const collectionName of collections) {
      console.log(`\nMigrating ${collectionName}...`);

      const filePath = path.join(exportPath, `${collectionName}.json`);

      if (!fs.existsSync(filePath)) {
        console.log(`  ⚠️  No data file found for ${collectionName}, skipping`);
        continue;
      }

      const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

      if (!Array.isArray(data) || data.length === 0) {
        console.log(`  ℹ️  No documents in ${collectionName}, skipping`);
        continue;
      }

      // Transform Firestore documents to MongoDB format
      const documents = data.map(doc => {
        // Firestore uses doc.id, MongoDB uses _id
        const { id, ...rest } = doc;
        return {
          _id: id || doc._id,
          ...rest,
          // Ensure timestamps are Date objects
          createdAt: doc.createdAt ? new Date(doc.createdAt) : new Date(),
          updatedAt: doc.updatedAt ? new Date(doc.updatedAt) : new Date()
        };
      });

      // Insert into Cosmos DB
      const collection = db.collection(collectionName);

      try {
        const result = await collection.insertMany(documents, { ordered: false });
        console.log(`  ✅ Migrated ${result.insertedCount} documents to ${collectionName}`);
      } catch (error) {
        if (error.code === 11000) {
          console.log(`  ⚠️  Some documents already exist in ${collectionName}, skipping duplicates`);
        } else {
          throw error;
        }
      }
    }

    console.log('\n🎉 Migration complete!');

  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await client.close();
  }
}

migrate();
```

### Step 4.3: Prepare Firebase Export

Manually export collections from Firebase Console:

```bash
# Via Firebase Console:

1. Go to https://console.firebase.google.com/project/mwci-tracker/firestore

2. For each collection (users, tasks, kpis, deliverables, auditLogs, columnPermissions):

   a. Click on the collection

   b. Click the 3 dots menu → "Export collection"

   c. Or manually copy data:
      - Open browser console (F12)
      - Run this script to export to JSON:

```javascript
// Run this in browser console on Firebase Console Firestore page
const exportCollection = async (collectionName) => {
  const db = firebase.firestore();
  const snapshot = await db.collection(collectionName).get();
  const docs = snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));

  // Download as JSON
  const dataStr = JSON.stringify(docs, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(dataBlob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${collectionName}.json`;
  link.click();
};

// Export all collections
exportCollection('users');
exportCollection('tasks');
exportCollection('kpis');
exportCollection('deliverables');
exportCollection('auditLogs');
exportCollection('columnPermissions');
```

Save all JSON files to `./firebase-export/` folder.

### Step 4.4: Run Migration

```bash
# Install MongoDB driver
npm install mongodb

# Run migration
COSMOS_CONNECTION_STRING="<your-cosmos-connection-string>" node migrate-to-cosmos.js

# Or pass connection string as argument
node migrate-to-cosmos.js "mongodb://mwci-tracker-db:..."

# Watch the output:
# ✅ Connected to Cosmos DB
#
# Migrating users...
#   ✅ Migrated 15 documents to users
#
# Migrating tasks...
#   ✅ Migrated 42 documents to tasks
#
# Migrating kpis...
#   ✅ Migrated 127 documents to kpis
#
# ... etc ...
#
# 🎉 Migration complete!
```

### Step 4.5: Verify Migration

```bash
# Via Azure Portal:

1. Go to https://portal.azure.com

2. Navigate to Resource groups → mwci-tracker-rg

3. Click on "mwci-tracker-db" (Cosmos DB)

4. Click "Data Explorer"

5. Expand "mwci-tracker" database

6. For each collection, click "Documents" and verify data is there

# Or via MongoDB shell:
mongo "<your-cosmos-connection-string>" --eval "
  db = db.getSiblingDB('mwci-tracker');
  print('Users: ' + db.users.count());
  print('Tasks: ' + db.tasks.count());
  print('KPIs: ' + db.kpis.count());
  print('Deliverables: ' + db.deliverables.count());
  print('Audit Logs: ' + db.auditLogs.count());
  print('Column Permissions: ' + db.columnPermissions.count());
"
```

**✅ Checkpoint**: All Firebase data is now in Cosmos DB!

---

## 🚀 PHASE 5: Update Application Code

**Timeline**: Day 6-8 (6-8 hours)
**Updates**: Replace Firebase SDK with Azure SDKs

### Step 5.1: Install Azure SDKs

```bash
cd /Users/husseinsrour/Downloads/MWCI_tracker

# Remove Firebase dependencies
npm uninstall firebase

# Install Azure dependencies
npm install @azure/cosmos
npm install @azure/storage-blob
npm install @azure/msal-browser @azure/msal-react
npm install mongodb

# Update package.json
npm install
```

### Step 5.2: Create Azure Configuration File

Create `src/azureConfig.ts`:

```typescript
import { LogLevel, PublicClientApplication } from '@azure/msal-browser';

// Azure AD B2C Configuration
export const b2cPolicies = {
  names: {
    signUpSignIn: 'B2C_1_signupsignin',
    forgotPassword: 'B2C_1_passwordreset'
  },
  authorities: {
    signUpSignIn: {
      authority: 'https://thakralonemwci.b2clogin.com/thakralonemwci.onmicrosoft.com/B2C_1_signupsignin'
    },
    forgotPassword: {
      authority: 'https://thakralonemwci.b2clogin.com/thakralonemwci.onmicrosoft.com/B2C_1_passwordreset'
    }
  },
  authorityDomain: 'thakralonemwci.b2clogin.com'
};

// MSAL Configuration
export const msalConfig = {
  auth: {
    clientId: import.meta.env.VITE_AZURE_AD_B2C_CLIENT_ID || '',
    authority: b2cPolicies.authorities.signUpSignIn.authority,
    knownAuthorities: [b2cPolicies.authorityDomain],
    redirectUri: window.location.origin,
    postLogoutRedirectUri: window.location.origin
  },
  cache: {
    cacheLocation: 'localStorage',
    storeAuthStateInCookie: false
  },
  system: {
    loggerOptions: {
      loggerCallback: (level: LogLevel, message: string, containsPii: boolean) => {
        if (containsPii) return;
        switch (level) {
          case LogLevel.Error:
            console.error(message);
            break;
          case LogLevel.Info:
            console.info(message);
            break;
          case LogLevel.Verbose:
            console.debug(message);
            break;
          case LogLevel.Warning:
            console.warn(message);
            break;
        }
      }
    }
  }
};

// Login request scopes
export const loginRequest = {
  scopes: ['openid', 'profile', 'email']
};

// Cosmos DB Configuration
export const cosmosConfig = {
  endpoint: import.meta.env.VITE_AZURE_COSMOS_ENDPOINT || '',
  key: import.meta.env.VITE_AZURE_COSMOS_KEY || '',
  databaseId: 'mwci-tracker',
  containers: {
    users: 'users',
    tasks: 'tasks',
    kpis: 'kpis',
    deliverables: 'deliverables',
    auditLogs: 'auditLogs',
    columnPermissions: 'columnPermissions'
  }
};

// Blob Storage Configuration
export const storageConfig = {
  accountName: import.meta.env.VITE_AZURE_STORAGE_ACCOUNT || '',
  containerName: 'uploads',
  sasToken: import.meta.env.VITE_AZURE_STORAGE_SAS_TOKEN || ''
};
```

### Step 5.3: Create Cosmos DB Service

Create `src/services/cosmosService.ts`:

```typescript
import { CosmosClient, Container, Database } from '@azure/cosmos';
import { cosmosConfig } from '../azureConfig';

// Initialize Cosmos Client
const client = new CosmosClient({
  endpoint: cosmosConfig.endpoint,
  key: cosmosConfig.key
});

// Get database
const database: Database = client.database(cosmosConfig.databaseId);

// Get containers
export const usersContainer: Container = database.container(cosmosConfig.containers.users);
export const tasksContainer: Container = database.container(cosmosConfig.containers.tasks);
export const kpisContainer: Container = database.container(cosmosConfig.containers.kpis);
export const deliverablesContainer: Container = database.container(cosmosConfig.containers.deliverables);
export const auditLogsContainer: Container = database.container(cosmosConfig.containers.auditLogs);
export const columnPermissionsContainer: Container = database.container(cosmosConfig.containers.columnPermissions);

// Helper functions
export async function getItem<T>(container: Container, id: string): Promise<T | null> {
  try {
    const { resource } = await container.item(id, id).read<T>();
    return resource || null;
  } catch (error: any) {
    if (error.code === 404) return null;
    throw error;
  }
}

export async function createItem<T>(container: Container, item: T): Promise<T> {
  const { resource } = await container.items.create<T>(item);
  return resource!;
}

export async function updateItem<T>(container: Container, id: string, item: T): Promise<T> {
  const { resource } = await container.item(id, id).replace<T>(item);
  return resource!;
}

export async function deleteItem(container: Container, id: string): Promise<void> {
  await container.item(id, id).delete();
}

export async function queryContainer<T>(
  container: Container,
  query: string | { query: string; parameters: Array<{ name: string; value: any }> }
): Promise<T[]> {
  const querySpec = typeof query === 'string' ? { query } : query;
  const { resources } = await container.items.query<T>(querySpec).fetchAll();
  return resources;
}
```

---

**Continue to AZURE_FULL_MIGRATION_PLAN.md for Phases 5.4-9 (Code updates, Testing, Deployment, Cleanup)**

---

## 📊 Progress Tracker

Track your migration progress:

- [ ] Phase 1: Azure DevOps Setup (Day 1)
  - [ ] 1.1: Create Azure DevOps organization
  - [ ] 1.2: Clone GitHub repo locally
  - [ ] 1.3: Add Azure DevOps remote
  - [ ] 1.4: Push code to Azure DevOps
  - [ ] 1.5: Set Azure DevOps as default

- [ ] Phase 2: Azure Resources (Day 2)
  - [ ] 2.1: Authenticate Azure CLI
  - [ ] 2.2: Create resource group
  - [ ] 2.3: Create Cosmos DB
  - [ ] 2.4: Create Blob Storage
  - [ ] 2.5: Create Azure AD B2C tenant
  - [ ] 2.6: Configure Azure AD B2C
  - [ ] 2.7: Create Azure Functions
  - [ ] 2.8: Create Static Web App
  - [ ] 2.9: Save all connection strings

- [ ] Phase 3: Azure Pipelines (Day 3)
  - [ ] 3.1: Create pipeline for Static Web App
  - [ ] 3.2: Add pipeline variable
  - [ ] 3.3: Test pipeline

- [ ] Phase 4: Data Migration (Day 4-5)
  - [ ] 4.1: Export Firebase data
  - [ ] 4.2: Create migration script
  - [ ] 4.3: Prepare Firebase export
  - [ ] 4.4: Run migration
  - [ ] 4.5: Verify migration

- [ ] Phase 5: Code Updates (Day 6-8)
  - [ ] 5.1: Install Azure SDKs
  - [ ] 5.2: Create Azure config
  - [ ] 5.3: Create Cosmos DB service
  - [ ] 5.4-5.10: Update all services (see AZURE_FULL_MIGRATION_PLAN.md)

- [ ] Phase 6: Testing (Day 8-9)
- [ ] Phase 7: Custom Domain (Day 10)
- [ ] Phase 8: Cleanup (Day 11-12)
- [ ] Phase 9: Documentation (Day 13-14)

---

## 🆘 Need Help?

If you get stuck at any phase:

1. Check Azure Portal for resource status
2. Check Azure DevOps Pipelines for build errors
3. Check Application Insights for runtime errors
4. Check Cosmos DB Data Explorer for data issues
5. Ask me! I'll help you troubleshoot.

---

**Ready to start? Let's begin with Phase 1!** 🚀

I'll help you through each step. Just let me know when you're ready to start!
