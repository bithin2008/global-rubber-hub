# OAuth Setup Guide for Global Rubber Hub

## Current Error
You're seeing the "Access blocked: This app's request is invalid" error because the OAuth configuration needs to be properly set up in the Google Cloud Console.

## Step-by-Step Fix

1. Go to [Google Cloud Console](https://console.cloud.google.com/)

2. Select your project or create a new one

3. Go to "APIs & Services" > "Credentials"

4. Create or edit your OAuth 2.0 Client ID:
   - For Web application:
     ```
     Application type: Web application
     Name: Global Rubber Hub Web
     Authorized JavaScript origins:
       - http://localhost:8100
       - http://localhost:4200
       - https://globalrubberhub.com (your production domain)
     Authorized redirect URIs:
       - http://localhost:8100
       - http://localhost:8100/
       - http://localhost:8100/login
       - http://localhost:4200
       - http://localhost:4200/
       - http://localhost:4200/login
       - https://globalrubberhub.com
       - https://globalrubberhub.com/
       - https://globalrubberhub.com/login
     ```

   - For Android application:
     ```
     Application type: Android
     Name: Global Rubber Hub Android
     Package name: com.globalrubber.hub
     SHA-1 certificate fingerprint: (your app's SHA-1 fingerprint)
     ```

5. After creating both client IDs, update src/app/config/auth.config.ts with the new client IDs:
   ```typescript
   export const authConfig = {
     googleAuth: {
       webClientId: 'YOUR_WEB_CLIENT_ID.apps.googleusercontent.com',
       androidClientId: 'YOUR_ANDROID_CLIENT_ID.apps.googleusercontent.com',
       serverClientId: 'YOUR_WEB_CLIENT_ID.apps.googleusercontent.com',
     },
     scopes: ['profile', 'email'],
     grantOfflineAccess: true,
     forceCodeForRefreshToken: true
   };
   ```

6. Important Notes:
   - Make sure you're using the correct client ID for each platform
   - The webClientId and serverClientId should be the same (the Web application client ID)
   - The androidClientId should be the Android-specific client ID
   - All URIs must be added exactly as shown above, including trailing slashes where indicated

7. After updating the configuration:
   - Clear your browser cache
   - Run `ionic build` to rebuild the application
   - For Android: rebuild and reinstall the app

8. Testing:
   - Test on Web: `ionic serve`
   - Test on Android: `ionic cap run android`

## Common Issues

1. If you still see "redirect_uri_mismatch":
   - Double-check all authorized redirect URIs in Google Cloud Console
   - Make sure they match exactly (including http/https and trailing slashes)
   - Check the browser console for the exact URI that's being rejected

2. If you see "invalid_client":
   - Verify the client IDs in auth.config.ts
   - Make sure you're using the correct client ID for each platform

3. If you see "unauthorized_client":
   - Check if the OAuth consent screen is properly configured
   - Verify the application is using the correct client ID for the platform

## Need Help?

If you're still seeing errors:
1. Check the browser console and note the exact error message
2. Verify the redirect URI being used matches one in your Google Cloud Console
3. Make sure your OAuth consent screen is configured and published
4. For Android, verify your SHA-1 fingerprint matches the one in Google Cloud Console
