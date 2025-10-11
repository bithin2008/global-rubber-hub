# Firebase + Google Sign-In Setup Guide

This guide will help you configure Firebase and Google Sign-In for your Ionic app.

## 1. Firebase Project Setup

### Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project" or "Add project"
3. Enter project name: `global-rubber-hub`
4. Enable Google Analytics (optional)
5. Create project

### Add Web App to Firebase Project
1. In Firebase Console, click the web icon (`</>`)
2. Enter app nickname: `Global Rubber Hub Web`
3. Check "Also set up Firebase Hosting" (optional)
4. Register app
5. Copy the Firebase configuration object

### Add Android App to Firebase Project
1. In Firebase Console, click "Add app" → Android
2. Enter package name: `com.globalrubberhub.app` (or your actual package name)
3. Enter app nickname: `Global Rubber Hub Android`
4. Download `google-services.json`
5. Place it in `platforms/android/app/`

### Add iOS App to Firebase Project (if needed)
1. In Firebase Console, click "Add app" → iOS
2. Enter bundle ID: `com.globalrubberhub.app` (or your actual bundle ID)
3. Enter app nickname: `Global Rubber Hub iOS`
4. Download `GoogleService-Info.plist`
5. Place it in `platforms/ios/App/App/`

## 2. Update Environment Configuration

Update your environment files with the Firebase configuration:

### `src/environments/environment.ts`
```typescript
export const environment = {  
  production: false,
  API_ENDPOINT: 'https://globalrubberhub.com/api/v1/',
  firebase: {
    apiKey: 'your-firebase-api-key',
    authDomain: 'your-project.firebaseapp.com',
    projectId: 'your-project-id',
    storageBucket: 'your-project.appspot.com',
    messagingSenderId: '123456789',
    appId: 'your-app-id',
    measurementId: 'your-measurement-id'
  }
};
```

### `src/environments/environment.prod.ts`
```typescript
export const environment = {
  production: true,
  API_ENDPOINT: 'https://globalrubberhub.com/api/v1/',
  firebase: {
    apiKey: 'your-production-firebase-api-key',
    authDomain: 'your-project.firebaseapp.com',
    projectId: 'your-project-id',
    storageBucket: 'your-project.appspot.com',
    messagingSenderId: '123456789',
    appId: 'your-app-id',
    measurementId: 'your-measurement-id'
  }
};
```

## 3. Enable Authentication

### Enable Google Sign-In
1. In Firebase Console, go to "Authentication" → "Sign-in method"
2. Click on "Google" provider
3. Enable Google sign-in
4. Add your project's support email
5. Save

### Configure OAuth Consent Screen (if needed)
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project
3. Go to "APIs & Services" → "OAuth consent screen"
4. Configure the consent screen
5. Add your domain to authorized domains

## 4. Configure Cloud Messaging

### Generate VAPID Key
1. In Firebase Console, go to "Project Settings" → "Cloud Messaging"
2. Generate a new key pair (VAPID key)
3. Copy the key

### Update Service Worker
Update `public/firebase-messaging-sw.js` with your Firebase configuration:

```javascript
firebase.initializeApp({
  apiKey: 'your-firebase-api-key',
  authDomain: 'your-project.firebaseapp.com',
  projectId: 'your-project-id',
  storageBucket: 'your-project.appspot.com',
  messagingSenderId: '123456789',
  appId: 'your-app-id',
  measurementId: 'your-measurement-id'
});
```

## 5. Backend Integration

### Update Your Backend API
Add these endpoints to your backend:

#### Google Sign-In Endpoint
```
POST /api/v1/auth/google-signin
Content-Type: application/json

{
  "uid": "firebase-user-uid",
  "email": "user@example.com",
  "displayName": "User Name",
  "photoURL": "https://example.com/photo.jpg",
  "fcmToken": "fcm-token-here"
}
```

#### FCM Token Endpoint
```
POST /api/v1/user/fcm-token
Content-Type: application/json
Authorization: Bearer your-jwt-token

{
  "fcmToken": "fcm-token-here",
  "platform": "web" // or "mobile"
}
```

#### Topic Subscription Endpoints
```
POST /api/v1/user/subscribe-topic
POST /api/v1/user/unsubscribe-topic
Content-Type: application/json
Authorization: Bearer your-jwt-token

{
  "topic": "topic-name",
  "fcmToken": "fcm-token-here"
}
```

## 6. Mobile Platform Setup

### Android Setup
1. Add to `platforms/android/app/build.gradle`:
```gradle
apply plugin: 'com.google.gms.google-services'
```

2. Add to `platforms/android/build.gradle`:
```gradle
classpath 'com.google.gms:google-services:4.3.15'
```

3. Ensure `google-services.json` is in `platforms/android/app/`

### iOS Setup (if needed)
1. Add to `platforms/ios/App/App/Info.plist`:
```xml
<key>CFBundleURLTypes</key>
<array>
    <dict>
        <key>CFBundleURLName</key>
        <string>REVERSED_CLIENT_ID</string>
        <key>CFBundleURLSchemes</key>
        <array>
            <string>YOUR_REVERSED_CLIENT_ID</string>
        </array>
    </dict>
</array>
```

## 7. Testing

### Test Google Sign-In
1. Run the app: `ionic serve`
2. Click "Sign in with Google"
3. Complete Google authentication
4. Check if user is logged in

### Test Push Notifications
1. **Web Testing:**
   - Open browser dev tools
   - Check for FCM token in console
   - Send test notification from Firebase Console

2. **Mobile Testing:**
   - Build and install on device
   - Check for registration token in logs
   - Send test notification from Firebase Console

## 8. Troubleshooting

### Common Issues

#### Google Sign-In Not Working
- Check if Google provider is enabled in Firebase Console
- Verify OAuth consent screen is configured
- Check browser console for errors

#### Push Notifications Not Working
- Verify VAPID key is correct
- Check if service worker is registered
- Ensure FCM token is being sent to backend
- Check Firebase Console for delivery status

#### CORS Issues
- Add your domain to Firebase authorized domains
- Check if API endpoints are properly configured

### Debug Steps
1. Check browser console for errors
2. Verify Firebase configuration
3. Test with Firebase Console
4. Check network requests in dev tools

## 9. Security Considerations

1. **API Keys:** Never commit API keys to version control
2. **Domain Restrictions:** Configure authorized domains in Firebase
3. **Token Validation:** Validate Firebase tokens on backend
4. **HTTPS:** Ensure all communications use HTTPS

## 10. Production Deployment

1. Update environment files with production Firebase config
2. Configure production OAuth consent screen
3. Set up proper domain restrictions
4. Test all functionality in production environment

## Support

For issues or questions:
1. Check Firebase documentation
2. Review Ionic Capacitor documentation
3. Check browser console for errors
4. Verify all configuration steps are completed
