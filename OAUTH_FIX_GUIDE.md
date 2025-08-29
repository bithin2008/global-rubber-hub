# Fix for Google OAuth Error

## Current Error
You're seeing "Access blocked: This app's request is invalid" with Error 400: redirect_uri_mismatch. This means the redirect URI being used doesn't match what's configured in Google Cloud Console.

## Step-by-Step Fix

1. Go to [Google Cloud Console](https://console.cloud.google.com/)

2. Navigate to:
   - APIs & Services
   - Credentials
   - Find your OAuth 2.0 Client ID for Web application

3. Add these exact URIs to "Authorized JavaScript origins":
   ```
   http://localhost:8101
   http://localhost:8100
   http://localhost:4200
   https://globalrubberhub.com
   ```

4. Add these exact URIs to "Authorized redirect URIs":
   ```
   http://localhost:8101
   http://localhost:8101/
   http://localhost:8101/login
   http://localhost:8100
   http://localhost:8100/
   http://localhost:8100/login
   http://localhost:4200
   http://localhost:4200/
   http://localhost:4200/login
   https://globalrubberhub.com
   https://globalrubberhub.com/
   https://globalrubberhub.com/login
   ```

5. Click "Save" at the bottom of the page

6. Wait 5-10 minutes for changes to propagate

7. Clear your browser cache:
   - Chrome: Settings > Privacy and security > Clear browsing data
   - Select "Cookies and other site data" and "Cached images and files"
   - Time range: Last hour
   - Click "Clear data"

8. Update your auth.config.ts:
   ```typescript
   export const authConfig = {
     googleAuth: {
       // Use the Web application client ID for both web and server
       webClientId: 'YOUR_WEB_CLIENT_ID.apps.googleusercontent.com',
       serverClientId: 'YOUR_WEB_CLIENT_ID.apps.googleusercontent.com',
       // Use the Android client ID only for Android
       androidClientId: 'YOUR_ANDROID_CLIENT_ID.apps.googleusercontent.com',
     },
     scopes: ['profile', 'email'],
     grantOfflineAccess: true,
     forceCodeForRefreshToken: true
   };
   ```

9. Important Notes:
   - Make sure to use the correct client IDs
   - The webClientId and serverClientId should be the same (from Web application)
   - The androidClientId should be different (from Android configuration)
   - Double-check there are no trailing spaces in the client IDs

10. Testing:
    - Stop your development server (Ctrl+C)
    - Clear browser cache
    - Run `ionic serve` again
    - Try signing in with Google

## Common Issues

If you still see errors:

1. Check the browser console for the exact redirect URI being used
2. Make sure that exact URI is in the authorized list
3. Verify you're using the correct client ID
4. Try in an incognito window
5. Make sure you're not signed into multiple Google accounts

## Need More Help?

If you're still seeing the error:
1. Check the browser console and note the exact error message
2. Look for the redirect_uri parameter in the error URL
3. Add that exact URI to your authorized redirect URIs list
4. Make sure your OAuth consent screen is configured and published
