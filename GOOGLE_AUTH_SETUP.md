# Google Auth Implementation Guide

## Overview
This project uses `@codetrix-studio/capacitor-google-auth` for Google authentication in the Ionic Angular app.

## Setup Requirements

### 1. Google Cloud Console Setup
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google+ API and Google Sign-In API
4. Create OAuth 2.0 credentials:
   - Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client IDs"
   - Add your app's package name (e.g., `io.ionic.starter`)
   - Download the `google-services.json` file

### 2. Android Configuration
1. Place `google-services.json` in `android/app/` directory
2. Update `android/app/build.gradle` to include Google Services plugin
3. Update `android/build.gradle` to include Google Services classpath

### 3. Capacitor Configuration
The `capacitor.config.ts` file is already configured with:
```typescript
plugins: {
  GoogleAuth: {
    scopes: ['profile', 'email'],
    serverClientId: 'YOUR_SERVER_CLIENT_ID',
    forceCodeForRefreshToken: true,
  },
}
```

### 4. Backend API Endpoint
Your backend should have a `google-login` endpoint that accepts:
```json
{
  "google_id": "user_google_id",
  "email": "user_email",
  "name": "user_display_name",
  "first_name": "user_given_name",
  "last_name": "user_family_name",
  "profile_picture": "user_image_url",
  "access_token": "google_access_token",
  "id_token": "google_id_token"
}
```

## Usage

### Frontend Implementation
The Google login is implemented in `src/app/login/login.page.ts`:

1. **Initialization**: Google Auth is initialized in `ngOnInit()`
2. **Login Flow**: `loginWithGoogle()` method handles the authentication
3. **Backend Integration**: `handleGoogleLoginSuccess()` sends data to your backend
4. **Error Handling**: Comprehensive error handling for various scenarios

### Features
- ✅ Native Google Sign-In on mobile devices
- ✅ Loading states and user feedback
- ✅ Error handling for network issues, cancellations, etc.
- ✅ Integration with existing authentication flow
- ✅ Token storage and user session management

### Testing
1. Build the app: `npm run build`
2. Sync Capacitor: `npx cap sync`
3. Open Android Studio: `npx cap open android`
4. Build and run from Android Studio
5. Test Google login on the login page

## Troubleshooting

### Common Issues
1. **"Google login is only available on mobile devices"**
   - This is expected behavior - Google Auth only works on native platforms

2. **"Google login failed"**
   - Check Google Cloud Console configuration
   - Verify `google-services.json` is properly placed
   - Ensure backend API endpoint is working

3. **"Network error"**
   - Check internet connection
   - Verify Google Services are accessible

### Debug Steps
1. Check console logs for detailed error messages
2. Verify Google Cloud Console configuration
3. Test backend API endpoint separately
4. Ensure all required plugins are installed

## Security Notes
- Never expose your Google Client Secret in frontend code
- Use server-side verification of Google tokens
- Implement proper session management
- Store sensitive data securely 