# Localhost Deep Link Testing Guide

This guide explains how to test deep links in your Ionic Cordova app during localhost development.

## 🚀 Quick Start

### 1. Start the Development Server

```bash
# Start the Ionic development server
ionic serve

# Or use Angular CLI
ng serve
```

Your app will be available at: `http://localhost:4200`

### 2. Access the Deep Link Demo

Navigate to: `http://localhost:4200/deep-link-demo`

This page provides various testing options for deep links.

## 📱 Testing Methods

### Method 1: Direct URL Navigation (Easiest)

Simply type these URLs directly in your browser:

#### Basic Deep Links
```
http://localhost:4200/item/123
http://localhost:4200/profile/456
http://localhost:4200/item/add
http://localhost:4200/bid/history
http://localhost:4200/notification
http://localhost:4200/verify
```

#### Deep Links with Parameters
```
http://localhost:4200/item/123?title=Premium%20Rubber&category=natural
http://localhost:4200/profile/456?name=John%20Doe
http://localhost:4200/bid/history?filter=active&sort=date
```

### Method 2: Using the Demo Component

1. Navigate to `http://localhost:4200/deep-link-demo`
2. Use the "Localhost Testing" section buttons
3. Click "Test Item Direct", "Test Profile Direct", etc.

### Method 3: Browser Console Testing

Open browser console and run:

```javascript
// Test deep link navigation
window.history.pushState({}, '', '/item/123?title=Test%20Item');
window.dispatchEvent(new PopStateEvent('popstate'));

// Or navigate directly
window.location.href = '/profile/456?name=Test%20User';
```

### Method 4: Programmatic Testing

In your component or service:

```typescript
import { DeepLinkService } from '../services/deep-link.service';

constructor(private deepLinkService: DeepLinkService) {}

// Test deep link
testDeepLink() {
  this.deepLinkService.testDeepLink('item/123', {
    title: 'Test Item',
    category: 'test'
  });
}
```

## 🔧 Testing Scenarios

### 1. Authentication Flow Testing

**Test Case**: Deep link when user is not logged in

1. Clear localStorage: `localStorage.clear()`
2. Navigate to: `http://localhost:4200/item/123`
3. Expected: Redirect to login page
4. After login: Should redirect to item page

**Test Case**: Deep link when user is logged in

1. Login to the app
2. Navigate to: `http://localhost:4200/profile/456`
3. Expected: Direct navigation to profile page

### 2. Parameter Handling Testing

**Test Case**: Deep link with query parameters

1. Navigate to: `http://localhost:4200/item/123?title=Premium%20Rubber&category=natural`
2. Check if parameters are accessible in the component:

```typescript
ngOnInit() {
  const urlParams = new URLSearchParams(window.location.search);
  const title = urlParams.get('title');
  const category = urlParams.get('category');
  console.log('Deep link params:', { title, category });
}
```

### 3. Route Mapping Testing

Test all mapped routes:

| Deep Link Path | Expected Route |
|----------------|----------------|
| `/item` | `item-list` |
| `/item/add` | `item-add` |
| `/item/my` | `my-item` |
| `/bid/history` | `bid-history` |
| `/bid/request` | `bid-request` |
| `/profile` | `profile` |
| `/account` | `account` |
| `/notification` | `notification` |
| `/verify` | `verify-now` |
| `/trusted-seller` | `trusted-seller` |

## 🛠️ Development Tools

### Browser Developer Tools

1. **Network Tab**: Monitor API calls when deep links trigger
2. **Console**: Check for deep link logs
3. **Application Tab**: Verify localStorage redirect storage

### Debug Logging

The deep link service includes debug logging. Check console for:

```
Web deep link detected: { path: "item/123", params: {...} }
Testing web deep link: /item/123?title=Test
Deep link received: {...}
```

### Testing with Different Browsers

Test in multiple browsers to ensure compatibility:

- Chrome: `http://localhost:4200/item/123`
- Firefox: `http://localhost:4200/item/123`
- Safari: `http://localhost:4200/item/123`
- Edge: `http://localhost:4200/item/123`

## 📋 Testing Checklist

### ✅ Basic Functionality
- [ ] Deep links work when user is authenticated
- [ ] Deep links redirect to login when user is not authenticated
- [ ] Post-login redirect works correctly
- [ ] URL parameters are preserved and accessible

### ✅ Route Mapping
- [ ] All mapped routes work correctly
- [ ] Invalid routes handle gracefully
- [ ] Route parameters are extracted properly

### ✅ User Experience
- [ ] Navigation is smooth and fast
- [ ] No broken links or 404 errors
- [ ] Browser back/forward buttons work
- [ ] URL updates correctly in address bar

### ✅ Error Handling
- [ ] Invalid deep links don't crash the app
- [ ] Malformed URLs are handled gracefully
- [ ] Network errors don't break deep linking

## 🐛 Troubleshooting

### Common Issues

**Issue**: Deep links not working in localhost
**Solution**: Ensure the deep link service is properly initialized in `app.component.ts`

**Issue**: Parameters not being passed correctly
**Solution**: Check URL encoding and parameter parsing in the service

**Issue**: Authentication redirect not working
**Solution**: Verify localStorage is being set/cleared correctly

**Issue**: Browser navigation not working
**Solution**: Check if `popstate` event listener is properly set up

### Debug Commands

```javascript
// Check if deep link service is working
console.log('Deep link service:', window.deepLinkService);

// Check current URL
console.log('Current URL:', window.location.href);

// Check localStorage
console.log('Deep link redirect:', localStorage.getItem('deep_link_redirect'));

// Test navigation manually
window.history.pushState({}, '', '/test-path');
```

## 🔄 Testing Workflow

### Daily Development Testing

1. Start development server: `ionic serve`
2. Navigate to demo page: `http://localhost:4200/deep-link-demo`
3. Test basic deep links
4. Test with authentication flow
5. Test parameter passing
6. Check console for errors

### Before Production

1. Test all deep link patterns
2. Verify authentication flow
3. Test on different browsers
4. Test with various URL parameters
5. Verify error handling
6. Test on mobile devices (if possible)

## 📱 Mobile Testing (Optional)

For testing on mobile devices during development:

1. **Use ngrok for external access**:
   ```bash
   # Install ngrok
   npm install -g ngrok

   # Start your app
   ionic serve

   # In another terminal, expose localhost
   ngrok http 4200
   ```

2. **Access from mobile**:
   - Use the ngrok URL on your mobile device
   - Test deep links: `https://your-ngrok-url.ngrok.io/item/123`

3. **Test mobile-specific features**:
   - Deep link from other apps
   - Share functionality
   - App state preservation

## 🎯 Best Practices

1. **Always test authentication flow** - Deep links should work for both logged-in and logged-out users
2. **Test with real data** - Use realistic IDs and parameters
3. **Check error scenarios** - Test with invalid URLs and parameters
4. **Monitor performance** - Ensure deep links don't slow down the app
5. **Test edge cases** - Very long URLs, special characters, etc.
6. **Document test cases** - Keep a list of working deep link patterns

## 📞 Support

If you encounter issues:

1. Check the browser console for errors
2. Verify the deep link service is initialized
3. Test with the demo component first
4. Check the network tab for failed requests
5. Verify route mapping is correct

For more complex issues, refer to the main `DEEPLINK_SETUP_GUIDE.md` file.
