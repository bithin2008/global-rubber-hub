# Google Auth Setup Guide for Ionic App

This guide will help you set up Google Authentication for your Ionic application.

## Prerequisites

1. Google Cloud Console account
2. Ionic project with Capacitor
3. Android/iOS development environment (for native apps)

## Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API and Google Identity Services API

## Step 2: Configure OAuth 2.0 Credentials

### For Web Platform:
1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth 2.0 Client IDs"
3. Choose "Web application"
4. Add authorized JavaScript origins:
   - `http://localhost:8100` (for development)
   - `https://yourdomain.com` (for production)
5. Add authorized redirect URIs:
   - `http://localhost:8100` (for development)
   - `https://yourdomain.com` (for production)
6. Copy the Client ID

### For Android Platform:
1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth 2.0 Client IDs"
3. Choose "Android"
4. Enter your package name (e.g., `io.ionic.starter`)
5. Generate SHA-1 fingerprint:
   ```bash
   keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android
   ```
6. Copy the Client ID

### For iOS Platform:
1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth 2.0 Client IDs"
3. Choose "iOS"
4. Enter your bundle ID (e.g., `io.ionic.starter`)
5. Copy the Client ID

## Step 3: Update Environment Configuration

Update your environment files with the Google Client IDs:

### `src/environments/environment.ts`:
```typescript
export const environment = {
  production: false,
  API_ENDPOINT: 'https://your-api-endpoint.com/api/',
  GOOGLE_CLIENT_ID: 'YOUR_WEB_CLIENT_ID.apps.googleusercontent.com',
  GOOGLE_SERVER_CLIENT_ID: 'YOUR_SERVER_CLIENT_ID.apps.googleusercontent.com'
};
```

### `src/environments/environment.prod.ts`:
```typescript
export const environment = {
  production: true,
  API_ENDPOINT: 'https://your-api-endpoint.com/api/',
  GOOGLE_CLIENT_ID: 'YOUR_WEB_CLIENT_ID.apps.googleusercontent.com',
  GOOGLE_SERVER_CLIENT_ID: 'YOUR_SERVER_CLIENT_ID.apps.googleusercontent.com'
};
```

## Step 4: Android Configuration

### Update `android/app/src/main/AndroidManifest.xml`:
```xml
<manifest>
    <application>
        <!-- Add this inside the application tag -->
        <meta-data
            android:name="com.google.android.gms.auth.api.signin.GoogleSignInOptions"
            android:value="@string/google_signin_options" />
    </application>
</manifest>
```

### Create `android/app/src/main/res/values/strings.xml`:
```xml
<?xml version="1.0" encoding="utf-8"?>
<resources>
    <string name="google_signin_options">{"web_client_id":"YOUR_WEB_CLIENT_ID.apps.googleusercontent.com"}</string>
</resources>
```

## Step 5: iOS Configuration

### Update `ios/App/App/Info.plist`:
```xml
<key>CFBundleURLTypes</key>
<array>
    <dict>
        <key>CFBundleURLName</key>
        <string>google</string>
        <key>CFBundleURLSchemes</key>
        <array>
            <string>com.googleusercontent.apps.YOUR_CLIENT_ID</string>
        </array>
    </dict>
</array>
```

## Step 6: Backend Integration

Your backend should handle the Google authentication token. The app sends the following data:

```json
{
  "google_id": "user_google_id",
  "email": "user_email",
  "name": "user_display_name",
  "first_name": "user_given_name",
  "last_name": "user_family_name",
  "profile_picture": "user_profile_picture_url",
  "access_token": "google_access_token",
  "id_token": "google_id_token"
}
```

## Step 7: Testing

1. **Web Platform**: Run `ionic serve` and test Google sign-in
2. **Android Platform**: Run `ionic capacitor run android`
3. **iOS Platform**: Run `ionic capacitor run ios`

## Troubleshooting

### Common Issues:

1. **"Sign in failed" error**: Check if Google Client ID is correct
2. **"Network error"**: Ensure Google APIs are enabled
3. **"Invalid redirect URI"**: Verify authorized redirect URIs in Google Console
4. **Android build errors**: Check SHA-1 fingerprint and package name
5. **iOS build errors**: Verify bundle ID and URL schemes

### Debug Tips:

1. Check browser console for web platform errors
2. Use `adb logcat` for Android debugging
3. Use Xcode console for iOS debugging
4. Verify network connectivity and API endpoints

## Security Notes

1. Never expose your Google Client Secret in client-side code
2. Always validate tokens on your backend
3. Use HTTPS in production
4. Implement proper token refresh mechanisms
5. Handle user logout properly

## Additional Resources

- [Google Identity Services Documentation](https://developers.google.com/identity/gsi/web)
- [Capacitor Google Auth Plugin](https://github.com/CodetrixStudio/CapacitorGoogleAuth)
- [Ionic Documentation](https://ionicframework.com/docs)
- [Google Cloud Console](https://console.cloud.google.com/) 