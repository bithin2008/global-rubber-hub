# Google Sign-In Troubleshooting Guide

## Current Configuration Status ✅

### ✅ Fixed Issues:
1. **google-services.json** - Properly configured with Android OAuth client
2. **config.xml** - cordova-plugin-googleplus properly configured
3. **Build Configuration** - Google Services plugin enabled
4. **Package Name** - Consistent across all configurations (`com.globalrubber.hub`)

### 🔧 Critical Steps You Must Complete:

## Step 1: Add SHA-1 Fingerprint to Firebase Console

**Your SHA-1:** `04:75:95:5F:F9:F8:6A:69:A3:87:8E:B8:42:B4:1F:6E:98:9E:1B:C8`

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select project: `global-rubber-hub-c754f`
3. Go to **Project Settings** → **General**
4. Scroll to **Your apps** section
5. Find your Android app (package: com.globalrubber.hub)
6. Click the **settings gear** icon
7. Click **Add fingerprint**
8. Add: `04:75:95:5F:F9:F8:6A:69:A3:87:8E:B8:42:B4:1F:6E:98:9E:1B:C8`
9. Click **Save**

## Step 2: Add SHA-1 Fingerprint to Google Cloud Console

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select project: `global-rubber-hub-c754f`
3. Go to **APIs & Services** → **Credentials**
4. Find your **Android** OAuth 2.0 client ID
5. Click **Edit** (pencil icon)
6. In **SHA-1 certificate fingerprints** section, click **Add fingerprint**
7. Add: `04:75:95:5F:F9:F8:6A:69:A3:87:8E:B8:42:B4:1F:6E:98:9E:1B:C8`
8. Click **Save**

## Step 3: Verify OAuth Consent Screen

1. In Google Cloud Console, go to **APIs & Services** → **OAuth consent screen**
2. Make sure the consent screen is configured
3. Add your domain to **Authorized domains** if needed
4. Save changes

## Step 4: Test the App

### Build and Install:
```bash
cordova build android
adb install platforms/android/app/build/outputs/apk/debug/app-debug.apk
```

### Check Console Logs:
When you test Google Sign-In, look for these debug messages:
- `=== GOOGLE SIGN-IN DEBUG START ===`
- `Platform check: {...}`
- `Environment webClientId: ...`
- `Google Plus plugin available: true/false`

## Common Error Solutions:

### ApiException: 10 (DEVELOPER_ERROR)
- **Cause:** Missing or incorrect SHA-1 fingerprint
- **Solution:** Add SHA-1 to both Firebase and Google Cloud Console

### ApiException: 7 (NETWORK_ERROR)
- **Cause:** Network connectivity issues
- **Solution:** Check internet connection, try again

### ApiException: 8 (INTERNAL_ERROR)
- **Cause:** Google Play Services issues
- **Solution:** Update Google Play Services on device

### ApiException: 12501 (SIGN_IN_CANCELLED)
- **Cause:** User cancelled sign-in
- **Solution:** This is normal user behavior

## Debug Information:

The app now includes comprehensive logging. Check the browser console or device logs for:
- Platform detection
- Plugin availability
- Error details
- Fallback mechanisms

## Alternative Approach:

If native Google Sign-In continues to fail, the app will automatically fall back to Firebase Web SDK authentication, which should work as a backup.

## Still Having Issues?

1. **Check the console logs** for specific error messages
2. **Verify SHA-1 fingerprints** are added to both consoles
3. **Test on a real device** (not emulator)
4. **Ensure Google Play Services** is updated on the device
5. **Check OAuth consent screen** configuration

## Contact Information:

If issues persist, provide:
1. The exact error message from console logs
2. Screenshots of Firebase Console settings
3. Screenshots of Google Cloud Console OAuth settings
4. Device information (Android version, Google Play Services version)
