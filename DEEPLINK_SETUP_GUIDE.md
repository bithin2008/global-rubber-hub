# Deep Link Setup Guide for Global Rubber Hub

This guide explains how to set up and use deep linking in your Ionic Cordova app.

## Overview

Deep linking allows users to navigate directly to specific content within your app from external sources like:
- Social media links
- Email links
- SMS links
- Web browser links
- Other apps

## Configuration

### 1. Plugin Installation

The deep linking functionality uses the `cordova-universal-links-plugin`:

```bash
ionic cordova plugin add cordova-universal-links-plugin
```

### 2. Config.xml Configuration

The app is configured with:
- **URL Scheme**: `globalrubberhub://`
- **Universal Links**: `https://globalrubberhub.com/*`
- **Android Path Prefix**: `/`

### 3. Deep Link Service

The `DeepLinkService` handles:
- Initializing deep link listeners
- Parsing incoming deep links
- Mapping URLs to app routes
- Handling authentication redirects

## Supported Deep Link Patterns

### Item Links
```
https://globalrubberhub.com/item/123
globalrubberhub://item/123
```

### Profile Links
```
https://globalrubberhub.com/profile/456
globalrubberhub://profile/456
```

### Feature Links
```
https://globalrubberhub.com/item/add
https://globalrubberhub.com/bid/history
https://globalrubberhub.com/notification
https://globalrubberhub.com/verify
```

## Implementation Details

### 1. Deep Link Service Methods

#### `initializeDeepLinking()`
Sets up listeners for deep link events when the app is running or launched.

#### `handleDeepLink(eventData)`
Processes incoming deep links and navigates to appropriate routes.

#### `createDeepLink(path, params)`
Generates deep link URLs for sharing content.

#### `handlePostLoginRedirect()`
Handles redirects after successful authentication.

### 2. Route Mapping

The service maps deep link paths to app routes:

```typescript
const routeMap = {
  'item': 'item-list',
  'item/add': 'item-add',
  'item/my': 'my-item',
  'bid/history': 'bid-history',
  'bid/request': 'bid-request',
  'profile': 'profile',
  'account': 'account',
  'notification': 'notification',
  'verify': 'verify-now',
  'trusted-seller': 'trusted-seller'
};
```

### 3. Authentication Handling

- If user is not authenticated, the intended route is stored
- After successful login, user is redirected to the intended route
- Uses `localStorage` to persist redirect information

## Usage Examples

### 1. Sharing an Item

```typescript
import { ShareService } from '../services/share.service';

constructor(private shareService: ShareService) {}

async shareItem() {
  await this.shareService.shareItem('123', 'Premium Rubber');
}
```

### 2. Creating Custom Deep Links

```typescript
import { DeepLinkService } from '../services/deep-link.service';

constructor(private deepLinkService: DeepLinkService) {}

createCustomLink() {
  const link = this.deepLinkService.createDeepLink('item/123', {
    title: 'Premium Rubber',
    category: 'natural'
  });
  // Returns: https://globalrubberhub.com/item/123?title=Premium%20Rubber&category=natural
}
```

### 3. Handling Deep Link Parameters

```typescript
// In your component
ngOnInit() {
  // Check for deep link parameters
  const urlParams = new URLSearchParams(window.location.search);
  const title = urlParams.get('title');
  const category = urlParams.get('category');
  
  if (title) {
    // Handle the title parameter
  }
}
```

## Testing Deep Links

### 1. Android Testing

```bash
# Test custom scheme
adb shell am start -W -a android.intent.action.VIEW -d "globalrubberhub://item/123" com.globalrubber.hub

# Test universal link
adb shell am start -W -a android.intent.action.VIEW -d "https://globalrubberhub.com/item/123" com.globalrubber.hub
```

### 2. iOS Testing

```bash
# Test custom scheme
xcrun simctl openurl booted "globalrubberhub://item/123"

# Test universal link
xcrun simctl openurl booted "https://globalrubberhub.com/item/123"
```

### 3. Web Testing

For web platform testing, you can use:
- Browser navigation to `https://globalrubberhub.com/item/123`
- Programmatic navigation: `window.location.href = 'https://globalrubberhub.com/item/123'`

## Production Setup

### 1. Domain Configuration

For production, ensure your domain `globalrubberhub.com` is properly configured with:
- SSL certificate
- Apple App Site Association (AASA) file
- Android Asset Links file

### 2. Apple App Site Association (AASA)

Create `/.well-known/apple-app-site-association`:

```json
{
  "applinks": {
    "apps": [],
    "details": [
      {
        "appID": "TEAM_ID.com.globalrubber.hub",
        "paths": ["*"]
      }
    ]
  }
}
```

### 3. Android Asset Links

Create `/.well-known/assetlinks.json`:

```json
[{
  "relation": ["delegate_permission/common.handle_all_urls"],
  "target": {
    "namespace": "android_app",
    "package_name": "com.globalrubber.hub",
    "sha256_cert_fingerprints": ["YOUR_SHA256_FINGERPRINT"]
  }
}]
```

## Troubleshooting

### Common Issues

1. **Deep links not working on Android**
   - Check Android manifest configuration
   - Verify intent filters are properly configured
   - Test with adb commands

2. **Deep links not working on iOS**
   - Verify AASA file is accessible
   - Check bundle identifier matches
   - Test with xcrun commands

3. **Universal links not working**
   - Ensure domain has valid SSL certificate
   - Check AASA and assetlinks files
   - Verify app configuration

### Debug Information

Enable debug logging in the DeepLinkService:

```typescript
console.log('Deep link received:', eventData);
console.log('Parsed path:', path);
console.log('Target route:', targetRoute);
```

## Security Considerations

1. **URL Validation**: Always validate incoming URLs
2. **Parameter Sanitization**: Sanitize query parameters
3. **Authentication**: Ensure proper authentication checks
4. **Rate Limiting**: Implement rate limiting for deep link requests

## Best Practices

1. **Graceful Fallbacks**: Always provide fallback behavior
2. **User Experience**: Ensure smooth navigation flow
3. **Error Handling**: Handle invalid or broken links
4. **Analytics**: Track deep link usage for insights
5. **Testing**: Test on multiple devices and platforms

## Support

For issues or questions regarding deep linking implementation, refer to:
- Cordova Universal Links Plugin documentation
- Ionic Framework documentation
- Platform-specific documentation (Android/iOS)
