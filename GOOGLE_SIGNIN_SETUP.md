# Google Sign-In Setup Guide

## Issue Fixed
The Google Sign-In button was opening in a browser instead of using native authentication on mobile devices. This has been fixed by implementing platform-specific authentication:

- **Mobile (Android/iOS)**: Uses `cordova-plugin-googleplus` for native authentication
- **Web Browser**: Uses Firebase Web SDK with popup authentication

## Configuration Required

### 1. Get Web Client ID from Google Console

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project: `global-rubber-hub-c754f`
3. Navigate to **APIs & Services** > **Credentials**
4. Find your **Web application** OAuth 2.0 client ID
5. Copy the Client ID (it looks like: `123456789-abcdefghijklmnop.apps.googleusercontent.com`)

### 2. Update Environment Files

Replace the placeholder in both environment files:

**src/environments/environment.ts:**
```typescript
webClientId: 'YOUR_ACTUAL_WEB_CLIENT_ID.apps.googleusercontent.com'
```

**src/environments/environment.prod.ts:**
```typescript
webClientId: 'YOUR_ACTUAL_WEB_CLIENT_ID.apps.googleusercontent.com'
```

### 3. Verify Cordova Plugin Configuration

The `cordova-plugin-googleplus` plugin is already installed. Make sure your `config.xml` has the correct configuration:

```xml
<plugin name="cordova-plugin-googleplus" source="npm">
    <param name="REVERSED_CLIENT_ID" value="YOUR_REVERSED_CLIENT_ID" />
    <param name="WEB_APPLICATION_CLIENT_ID" value="YOUR_WEB_CLIENT_ID" />
</plugin>
```

## How It Works Now

### Mobile Platforms (Android/iOS)
- Uses native Google Sign-In through `cordova-plugin-googleplus`
- No browser popup - authentication happens within the app
- Better user experience with native UI

### Web Browsers
- Uses Firebase Web SDK with popup authentication
- Maintains existing web functionality

## Testing

1. **Mobile Testing**: Build and test on actual Android/iOS devices
2. **Web Testing**: Test in browser - should still use popup
3. **Check Console**: Look for platform detection logs to verify correct method is being used

## Troubleshooting

If you encounter issues:

1. **"Google Plus plugin not available"**: Ensure `cordova-plugin-googleplus` is properly installed
2. **"Google Sign-In is not available on this device"**: Check Google Play Services on Android
3. **Authentication fails**: Verify the web client ID is correct and matches your Google Console configuration

## Files Modified

- `src/app/services/firebase.service.ts` - Updated to use platform-specific authentication
- `src/environments/environment.ts` - Added webClientId configuration
- `src/environments/environment.prod.ts` - Added webClientId configuration
