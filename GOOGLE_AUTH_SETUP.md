# Google OAuth Setup Guide

To fix the "redirect_uri_mismatch" error, you need to add the following redirect URIs to your Google Cloud Console project:

## Web Application URIs
Add these URIs to the "Authorized redirect URIs" section in your Google Cloud Console:

1. Development URLs:
   - `http://localhost:8100/`
   - `http://localhost:8100/login`
   - `http://localhost:4200/`
   - `http://localhost:4200/login`
   - `http://localhost/`
   - `capacitor://localhost`
   - `http://localhost/*`

2. Production URLs (replace with your actual domain):
   - `https://globalrubberhub.com/`
   - `https://globalrubberhub.com/login`
   - `https://www.globalrubberhub.com/`
   - `https://www.globalrubberhub.com/login`

## Android Application
For Android, add your app's signing-certificate fingerprint:
- Package name: `com.globalrubber.hub`
- SHA-1 certificate fingerprint from your keystore

## Steps to Add Redirect URIs:

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project
3. Go to "APIs & Services" > "Credentials"
4. Find your OAuth 2.0 Client ID and click "Edit"
5. Add all the above URIs to the "Authorized redirect URIs" section
6. Click "Save"

## Additional Configuration:

1. Make sure "Authorized JavaScript origins" includes:
   - `http://localhost:8100`
   - `http://localhost:4200`
   - `http://localhost`
   - `https://globalrubberhub.com`
   - `https://www.globalrubberhub.com`

2. For Android:
   - Add your app's package name
   - Add your SHA-1 certificate fingerprint

## Testing:

After adding these URIs:
1. Clear your browser cache
2. Sign out of any Google accounts
3. Try the login again
4. If using Android, rebuild and reinstall the app

If you still encounter issues, check the browser console for the exact redirect URI that's being used and add it to the authorized list.