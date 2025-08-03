# Google Authentication Setup for Android

## Overview
This guide explains how to complete the Google Authentication setup for your Android app.

## Required Steps

### 1. Google Console Configuration

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project: **global-rubber-hub**
3. Navigate to **APIs & Services > Credentials**

### 2. Create Android OAuth Client ID

1. Click **+ CREATE CREDENTIALS > OAuth 2.0 Client IDs**
2. Select **Android** as application type
3. Enter the following details:
   - **Name**: Global Rubber Hub Android
   - **Package name**: `com.globalrubber.hub`
   - **SHA-1 certificate fingerprint**: [See instructions below]

### 3. Your SHA-1 Fingerprint

**Debug SHA-1 Fingerprint (for development):**
```
04:75:95:5F:F9:F8:6A:69:A3:87:8E:B8:42:B4:1F:6E:98:9E:1B:C8
```

Use this SHA-1 fingerprint when creating your Android OAuth client in Google Console.

### 4. Update Configuration Files

After creating the Android OAuth client, update the following files:

#### Update `android/app/google-services.json`:
- Replace `YOUR_ANDROID_APP_ID` with your actual Android app ID
- Replace `YOUR_ANDROID_CLIENT_ID` with your new Android OAuth client ID  
- Replace `YOUR_SHA1_FINGERPRINT` with your actual SHA-1 fingerprint
- Replace `YOUR_API_KEY` with your API key from Google Console

#### Update `src/environments/environment.ts` and `environment.prod.ts`:
- Replace `YOUR_ANDROID_CLIENT_ID` with your actual Android OAuth client ID

### 5. Enable APIs

Make sure these APIs are enabled in Google Console:
- Google+ API
- Google Sign-In API

### 6. Build and Test

1. Clean and rebuild your project:
   ```bash
   npm run build
   npx cap sync android
   ```

2. Test on a physical Android device (Google Sign-In doesn't work properly on emulators)

## Troubleshooting

### Common Issues:

1. **"Developer Error" message**: 
   - Check that SHA-1 fingerprint matches exactly
   - Ensure package name matches (`com.globalrubber.hub`)

2. **Sign-in popup doesn't appear**:
   - Verify `google-services.json` is properly configured
   - Check that Google Play Services is installed on the device

3. **"Invalid client" error**:
   - Verify the Android client ID is correct
   - Make sure the client ID corresponds to the correct project

### Debug Commands:

Check current SHA-1 fingerprint:
```bash
./gradlew signingReport
```

Verify Google services configuration:
```bash
npx cap sync android
npx cap open android
```

## Current Configuration Status

✅ Cleaned up conflicting dependencies  
✅ Added Google services configuration template  
✅ Updated environment files with separate client IDs  
✅ Fixed Capacitor GoogleAuth plugin configuration  
✅ Updated authentication service implementation  

⚠️ **REQUIRED**: You must complete the Google Console setup and update the placeholder values in `google-services.json` and environment files.