# Play Store Deep Link Testing Guide

This guide explains how to thoroughly test deep links in your Ionic Cordova app before uploading to the Google Play Store.

## 🚀 **Pre-Testing Setup**

### **1. Build Production APK**

```bash
# Build for production
ionic cordova build android --prod --release

# Or build debug version for testing
ionic cordova build android --debug
```

### **2. Install on Test Device**

```bash
# Install on connected device
ionic cordova run android --device

# Or install APK manually
adb install platforms/android/app/build/outputs/apk/debug/app-debug.apk
```

## 📱 **Testing Methods**

### **Method 1: ADB Commands (Most Reliable)**

Connect your device via USB and use ADB commands:

#### **Test Custom Scheme Deep Links**
```bash
# Test custom scheme
adb shell am start -W -a android.intent.action.VIEW -d "globalrubberhub://item/123" com.globalrubber.hub

# Test with parameters
adb shell am start -W -a android.intent.action.VIEW -d "globalrubberhub://item/123?title=Test%20Item&category=natural" com.globalrubber.hub

# Test profile deep link
adb shell am start -W -a android.intent.action.VIEW -d "globalrubberhub://profile/456" com.globalrubber.hub

# Test add item
adb shell am start -W -a android.intent.action.VIEW -d "globalrubberhub://item/add" com.globalrubber.hub
```

#### **Test Universal Links (HTTPS)**
```bash
# Test universal link
adb shell am start -W -a android.intent.action.VIEW -d "https://globalrubberhub.com/item/123" com.globalrubber.hub

# Test with parameters
adb shell am start -W -a android.intent.action.VIEW -d "https://globalrubberhub.com/item/123?title=Test%20Item" com.globalrubber.hub
```

### **Method 2: Browser Testing**

1. **Open Chrome on your device**
2. **Navigate to your deep links**:
   ```
   https://globalrubberhub.com/item/123
   https://globalrubberhub.com/profile/456
   https://globalrubberhub.com/item/add
   ```
3. **Expected behavior**: Should open your app directly

### **Method 3: Share from Other Apps**

1. **Use WhatsApp, Gmail, or any messaging app**
2. **Share a deep link**: `https://globalrubberhub.com/item/123`
3. **Click the link** - should open your app

### **Method 4: In-App Testing**

Add a test button in your app:

```typescript
// In any component
testDeepLink() {
  const link = 'https://globalrubberhub.com/item/123';
  window.open(link, '_blank');
}
```

## 🔧 **Testing Scenarios**

### **1. App State Testing**

#### **App Closed**
```bash
# Kill the app first
adb shell am force-stop com.globalrubber.hub

# Then test deep link
adb shell am start -W -a android.intent.action.VIEW -d "globalrubberhub://item/123" com.globalrubber.hub
```
**Expected**: App should launch and navigate to the correct page

#### **App in Background**
```bash
# Send app to background
adb shell input keyevent KEYCODE_HOME

# Test deep link
adb shell am start -W -a android.intent.action.VIEW -d "globalrubberhub://item/123" com.globalrubber.hub
```
**Expected**: App should come to foreground and navigate correctly

#### **App Already Open**
```bash
# With app open, test deep link
adb shell am start -W -a android.intent.action.VIEW -d "globalrubberhub://item/123" com.globalrubber.hub
```
**Expected**: Should navigate within the app without restarting

### **2. Authentication Flow Testing**

#### **User Not Logged In**
```bash
# Clear app data to simulate fresh install
adb shell pm clear com.globalrubber.hub

# Test deep link
adb shell am start -W -a android.intent.action.VIEW -d "globalrubberhub://item/123" com.globalrubber.hub
```
**Expected**: Should redirect to login page, then to intended page after login

#### **User Logged In**
```bash
# Login to the app first, then test
adb shell am start -W -a android.intent.action.VIEW -d "globalrubberhub://item/123" com.globalrubber.hub
```
**Expected**: Should navigate directly to the intended page

### **3. Parameter Testing**

#### **Test Various Parameters**
```bash
# Test with title parameter
adb shell am start -W -a android.intent.action.VIEW -d "globalrubberhub://item/123?title=Premium%20Rubber" com.globalrubber.hub

# Test with multiple parameters
adb shell am start -W -a android.intent.action.VIEW -d "globalrubberhub://item/123?title=Test&category=natural&price=100" com.globalrubber.hub

# Test with special characters
adb shell am start -W -a android.intent.action.VIEW -d "globalrubberhub://item/123?title=Test%20%26%20More" com.globalrubber.hub
```

### **4. Route Mapping Testing**

Test all your mapped routes:

```bash
# Test all routes systematically
adb shell am start -W -a android.intent.action.VIEW -d "globalrubberhub://item" com.globalrubber.hub
adb shell am start -W -a android.intent.action.VIEW -d "globalrubberhub://item/add" com.globalrubber.hub
adb shell am start -W -a android.intent.action.VIEW -d "globalrubberhub://item/my" com.globalrubber.hub
adb shell am start -W -a android.intent.action.VIEW -d "globalrubberhub://bid/history" com.globalrubber.hub
adb shell am start -W -a android.intent.action.VIEW -d "globalrubberhub://bid/request" com.globalrubber.hub
adb shell am start -W -a android.intent.action.VIEW -d "globalrubberhub://profile" com.globalrubber.hub
adb shell am start -W -a android.intent.action.VIEW -d "globalrubberhub://account" com.globalrubber.hub
adb shell am start -W -a android.intent.action.VIEW -d "globalrubberhub://notification" com.globalrubber.hub
adb shell am start -W -a android.intent.action.VIEW -d "globalrubberhub://verify" com.globalrubber.hub
adb shell am start -W -a android.intent.action.VIEW -d "globalrubberhub://trusted-seller" com.globalrubber.hub
```

## 🛠️ **Debugging Tools**

### **1. Logcat Monitoring**

Monitor logs while testing:

```bash
# Monitor logs in real-time
adb logcat | grep -E "(DeepLink|universalLinks|globalrubberhub)"

# Or monitor all logs
adb logcat
```

### **2. Chrome Remote Debugging**

1. **Enable USB debugging** on your device
2. **Open Chrome** on your computer
3. **Navigate to**: `chrome://inspect`
4. **Inspect your app** and check console logs

### **3. App Inspection**

```bash
# Check if app is installed
adb shell pm list packages | grep globalrubber

# Check app info
adb shell dumpsys package com.globalrubber.hub

# Check intent filters
adb shell dumpsys package com.globalrubber.hub | grep -A 10 -B 10 "android.intent.action.VIEW"
```

## 📋 **Testing Checklist**

### ✅ **Basic Functionality**
- [ ] Deep links work when app is closed
- [ ] Deep links work when app is in background
- [ ] Deep links work when app is already open
- [ ] Custom scheme (`globalrubberhub://`) works
- [ ] Universal links (`https://globalrubberhub.com/`) work
- [ ] Parameters are passed correctly
- [ ] URL encoding/decoding works properly

### ✅ **Authentication Flow**
- [ ] Deep links redirect to login when user not authenticated
- [ ] Post-login redirect works correctly
- [ ] Deep links work directly when user is authenticated
- [ ] Token validation works properly

### ✅ **Route Mapping**
- [ ] All mapped routes work correctly
- [ ] Invalid routes handle gracefully
- [ ] Route parameters are extracted properly
- [ ] Navigation is smooth and fast

### ✅ **User Experience**
- [ ] No app crashes on deep link
- [ ] Loading states are handled properly
- [ ] Error states are handled gracefully
- [ ] Back navigation works correctly
- [ ] App state is preserved properly

### ✅ **Cross-Platform Testing**
- [ ] Test on different Android versions (8, 9, 10, 11, 12, 13)
- [ ] Test on different screen sizes
- [ ] Test on different manufacturers (Samsung, Google, OnePlus, etc.)
- [ ] Test with different browsers (Chrome, Firefox, Samsung Internet)

## 🐛 **Common Issues & Solutions**

### **Issue**: Deep links not working
**Solutions**:
1. Check if the app is properly installed
2. Verify intent filters in AndroidManifest.xml
3. Check if the deep link plugin is properly configured
4. Ensure the app package name matches

### **Issue**: App crashes on deep link
**Solutions**:
1. Check console logs for errors
2. Verify route mapping is correct
3. Ensure all required services are initialized
4. Check for null/undefined values in deep link handling

### **Issue**: Parameters not being passed
**Solutions**:
1. Check URL encoding/decoding
2. Verify parameter parsing logic
3. Ensure parameters are properly extracted in the service

### **Issue**: Authentication redirect not working
**Solutions**:
1. Check localStorage operations
2. Verify authentication service integration
3. Ensure redirect logic is properly implemented

## 🔄 **Testing Workflow**

### **Daily Testing**
1. Build and install the latest version
2. Test basic deep link functionality
3. Test authentication flow
4. Test parameter passing
5. Check console logs for errors

### **Before Play Store Upload**
1. **Build production APK**
2. **Test on multiple devices** (at least 3 different devices)
3. **Test all deep link patterns**
4. **Test authentication scenarios**
5. **Test error handling**
6. **Test performance** (deep links should be fast)
7. **Test with real data**
8. **Document any issues found**

### **Post-Upload Testing**
1. **Download from Play Store** (internal testing)
2. **Test deep links** with the Play Store version
3. **Verify all functionality** works as expected
4. **Test on different network conditions**

## 📱 **Device Testing Matrix**

| Device Type | Android Version | Screen Size | Test Status |
|-------------|----------------|-------------|-------------|
| Google Pixel | Android 13 | 6.3" | ⬜ |
| Samsung Galaxy | Android 12 | 6.1" | ⬜ |
| OnePlus | Android 11 | 6.7" | ⬜ |
| Xiaomi | Android 10 | 6.4" | ⬜ |
| Huawei | Android 9 | 5.8" | ⬜ |

## 🎯 **Best Practices**

1. **Test on real devices** - Emulators may not behave exactly like real devices
2. **Test on multiple Android versions** - Different versions handle deep links differently
3. **Test with slow network** - Ensure deep links work with poor connectivity
4. **Test with app in different states** - Closed, background, foreground
5. **Test with various parameters** - Empty, long, special characters
6. **Monitor performance** - Deep links should be fast
7. **Document test results** - Keep track of what works and what doesn't
8. **Test edge cases** - Invalid URLs, malformed parameters, etc.

## 📞 **Support**

If you encounter issues:

1. **Check the logs**: `adb logcat`
2. **Verify configuration**: Check config.xml and AndroidManifest.xml
3. **Test with simple deep links first**: Start with basic functionality
4. **Check plugin installation**: Ensure cordova-universal-links-plugin is properly installed
5. **Verify route mapping**: Ensure all routes are correctly mapped

For more complex issues, refer to the main `DEEPLINK_SETUP_GUIDE.md` file.
