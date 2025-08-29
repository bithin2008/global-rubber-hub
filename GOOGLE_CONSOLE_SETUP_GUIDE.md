# 🔧 Complete Google Console Setup for Android

## ⚠️ URGENT: Your Google sign-in is failing because the configuration is incomplete

**Error:** Developer error (code 12) - Google services not properly configured

## 📋 Step-by-Step Setup Guide

### Step 1: Go to Google Cloud Console
1. Visit: https://console.cloud.google.com/
2. Select your project: **global-rubber-hub** (Project ID: 1067170807523)

### Step 2: Create Android OAuth Client
1. Navigate to **APIs & Services > Credentials**
2. Click **+ CREATE CREDENTIALS**
3. Select **OAuth 2.0 Client IDs**
4. Choose **Android** as application type
5. Fill in the details:
   - **Name**: `Global Rubber Hub Android`
   - **Package name**: `com.globalrubber.hub`
   - **SHA-1 certificate fingerprint**: `15:3C:7D:5C:99:9D:F5:F7:83:04:29:4A:AF:D2:26:D6:17:98:75:77`

### Step 3: Download google-services.json
1. After creating the OAuth client, go to **APIs & Services > Credentials**
2. Find your Android app configuration
3. Click the **Download JSON** button
4. Save it as `google-services.json`

### Step 4: Replace Configuration Files

**Replace `/android/app/google-services.json` with the downloaded file**

**Or manually update these values in the existing file:**
- Replace `YOUR_ANDROID_APP_ID` with your actual Android app ID (from downloaded JSON)
- Replace `YOUR_ANDROID_CLIENT_ID` with your new Android OAuth client ID
- Replace `YOUR_SHA1_FINGERPRINT` with: `15:3C:7D:5C:99:9D:F5:F7:83:04:29:4A:AF:D2:26:D6:17:98:75:77`
- Replace `YOUR_API_KEY` with your API key (from downloaded JSON)

### Step 5: Update Environment Files

Update both `src/environments/environment.ts` and `environment.prod.ts`:
```typescript
GOOGLE_ANDROID_CLIENT_ID: 'YOUR_NEW_ANDROID_CLIENT_ID.apps.googleusercontent.com'
```

### Step 6: Enable Required APIs
Make sure these APIs are enabled in Google Console:
- **Google Sign-In API**
- **Google+ API** 

### Step 7: Test the Setup
1. Build and sync:
   ```bash
   npm run build
   npx cap sync android
   npx cap run android
   ```

2. Test Google sign-in on a **physical Android device** (not emulator)

## 🔧 Quick Fix Commands

After updating the configuration files:
```bash
cd /d/Global\ Rubber\ Hub/global-rubber-hub
npm run build
npx cap sync android
```

## ✅ What Should Happen
- Google sign-in popup should appear
- User can select their Google account
- Sign-in completes successfully
- User is redirected to dashboard

## 🚨 Common Issues
- **"Developer Error"** = Configuration incomplete (current issue)
- **"Sign-in cancelled"** = User cancelled the process
- **"Google Play Services error"** = Update Google Play Services

---

**Current Status:** ❌ Configuration incomplete - needs Google Console setup
**Next Action:** Complete Steps 1-5 above to fix the Google sign-in