# PC Deep Link Testing Guide - Complete Process

This guide provides the complete step-by-step process to test deep links on your PC before uploading to the Play Store.

## 🛠️ **Step 1: Install Required Tools**

### **1.1 Install Android Studio (Recommended)**

1. **Download Android Studio**:
   - Go to: https://developer.android.com/studio
   - Download the latest version for Windows

2. **Install Android Studio**:
   - Run the installer
   - Follow the installation wizard
   - Make sure to install Android SDK

3. **Add ADB to PATH**:
   - Open **System Properties** → **Environment Variables**
   - Under **System Variables**, find **Path** and click **Edit**
   - Add new entry: `C:\Users\[YourUsername]\AppData\Local\Android\Sdk\platform-tools`
   - Click **OK** to save

4. **Verify Installation**:
   ```bash
   adb version
   ```
   Should show ADB version information.

### **1.2 Alternative: Install ADB Only**

If you don't want full Android Studio:

1. **Download Platform Tools**:
   - Go to: https://developer.android.com/studio/releases/platform-tools
   - Download for Windows

2. **Extract and Setup**:
   - Extract to `C:\adb`
   - Add `C:\adb` to your PATH environment variable

## 📱 **Step 2: Prepare Your Android Device**

### **2.1 Enable Developer Options**

1. **Go to Settings** → **About Phone**
2. **Tap "Build Number" 7 times**
3. **Go back to Settings** → **Developer Options**
4. **Enable "USB Debugging"**

### **2.2 Connect Device**

1. **Connect your phone via USB cable**
2. **Select "File Transfer" or "MTP" mode**
3. **Allow USB debugging when prompted**
4. **Verify connection**:
   ```bash
   adb devices
   ```
   Should show your device listed.

## 🔨 **Step 3: Build Your App**

### **3.1 Build the App**

```bash
# Navigate to your project directory
cd "D:\Global Rubber Hub\global-rubber-hub"

# Build the web assets first
npm run build

# Build for Android (if you have Cordova properly set up)
ionic cordova build android --debug
```

### **3.2 Install on Device**

```bash
# Install the app on your connected device
ionic cordova run android --device

# Or install APK manually
adb install platforms/android/app/build/outputs/apk/debug/app-debug.apk
```

## 🧪 **Step 4: Test Deep Links**

### **4.1 Manual Testing with ADB**

#### **Test Custom Scheme Deep Links**

```bash
# Test item detail page
adb shell am start -W -a android.intent.action.VIEW -d "globalrubberhub://item/123" com.globalrubber.hub

# Test profile page
adb shell am start -W -a android.intent.action.VIEW -d "globalrubberhub://profile/456" com.globalrubber.hub

# Test add item page
adb shell am start -W -a android.intent.action.VIEW -d "globalrubberhub://item/add" com.globalrubber.hub

# Test bid history
adb shell am start -W -a android.intent.action.VIEW -d "globalrubberhub://bid/history" com.globalrubber.hub

# Test bid request
adb shell am start -W -a android.intent.action.VIEW -d "globalrubberhub://bid/request" com.globalrubber.hub

# Test profile
adb shell am start -W -a android.intent.action.VIEW -d "globalrubberhub://profile" com.globalrubber.hub

# Test account
adb shell am start -W -a android.intent.action.VIEW -d "globalrubberhub://account" com.globalrubber.hub

# Test notification
adb shell am start -W -a android.intent.action.VIEW -d "globalrubberhub://notification" com.globalrubber.hub

# Test verify
adb shell am start -W -a android.intent.action.VIEW -d "globalrubberhub://verify" com.globalrubber.hub

# Test trusted seller
adb shell am start -W -a android.intent.action.VIEW -d "globalrubberhub://trusted-seller" com.globalrubber.hub
```

#### **Test Universal Links (HTTPS)**

```bash
# Test universal links
adb shell am start -W -a android.intent.action.VIEW -d "https://globalrubberhub.com/item/123" com.globalrubber.hub

adb shell am start -W -a android.intent.action.VIEW -d "https://globalrubberhub.com/profile/456" com.globalrubber.hub

adb shell am start -W -a android.intent.action.VIEW -d "https://globalrubberhub.com/item/add" com.globalrubber.hub
```

#### **Test with Parameters**

```bash
# Test with title parameter
adb shell am start -W -a android.intent.action.VIEW -d "globalrubberhub://item/123?title=Premium%20Rubber" com.globalrubber.hub

# Test with multiple parameters
adb shell am start -W -a android.intent.action.VIEW -d "globalrubberhub://item/123?title=Test&category=natural&price=100" com.globalrubber.hub

# Test with special characters
adb shell am start -W -a android.intent.action.VIEW -d "globalrubberhub://item/123?title=Test%20%26%20More" com.globalrubber.hub
```

### **4.2 Automated Testing**

#### **Use the Windows Batch Script**

1. **Run the automated test script**:
   ```bash
   # Double-click the file or run from command line
   test-deeplinks.bat
   ```

2. **The script will automatically**:
   - Check if device is connected
   - Verify app is installed
   - Test all deep link scenarios
   - Show results for each test

### **4.3 Browser Testing**

1. **Open Chrome on your device**
2. **Navigate to these URLs**:
   ```
   https://globalrubberhub.com/item/123
   https://globalrubberhub.com/profile/456
   https://globalrubberhub.com/item/add
   ```
3. **Expected**: Should open your app directly

### **4.4 Share from Other Apps**

1. **Use WhatsApp, Gmail, or any messaging app**
2. **Share a deep link**: `https://globalrubberhub.com/item/123`
3. **Click the link** - should open your app

## 🔧 **Step 5: Test Different Scenarios**

### **5.1 App State Testing**

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

### **5.2 Authentication Flow Testing**

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

## 🛠️ **Step 6: Debugging and Monitoring**

### **6.1 Monitor Logs**

```bash
# Monitor deep link logs in real-time
adb logcat | findstr "DeepLink"

# Monitor universal links
adb logcat | findstr "universalLinks"

# Monitor all logs
adb logcat
```

### **6.2 Chrome Remote Debugging**

1. **Enable USB debugging** on your device
2. **Open Chrome** on your computer
3. **Navigate to**: `chrome://inspect`
4. **Inspect your app** and check console logs

### **6.3 App Inspection**

```bash
# Check if app is installed
adb shell pm list packages | findstr "globalrubber"

# Check app info
adb shell dumpsys package com.globalrubber.hub

# Check intent filters
adb shell dumpsys package com.globalrubber.hub | findstr "android.intent.action.VIEW"
```

## 📋 **Step 7: Testing Checklist**

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

## 🐛 **Step 8: Troubleshooting**

### **Common Issues and Solutions**

#### **Issue**: ADB not recognized
**Solution**: 
- Install Android Studio or add ADB to PATH
- Restart command prompt after adding to PATH

#### **Issue**: Device not detected
**Solution**:
- Enable USB debugging
- Install device drivers
- Try different USB cable
- Check USB connection mode

#### **Issue**: Deep links not working
**Solution**:
- Check if app is properly installed
- Verify intent filters in AndroidManifest.xml
- Check if deep link plugin is configured
- Ensure app package name matches

#### **Issue**: App crashes on deep link
**Solution**:
- Check console logs for errors
- Verify route mapping is correct
- Ensure all services are initialized
- Check for null/undefined values

#### **Issue**: Parameters not being passed
**Solution**:
- Check URL encoding/decoding
- Verify parameter parsing logic
- Ensure parameters are properly extracted

## 🔄 **Step 9: Testing Workflow**

### **Daily Testing Process**

1. **Connect device** and verify with `adb devices`
2. **Build and install** latest version
3. **Test basic deep links** with ADB commands
4. **Test authentication flow**
5. **Test parameter passing**
6. **Check console logs** for errors
7. **Document any issues** found

### **Before Play Store Upload**

1. **Build production APK**
2. **Test on multiple devices** (at least 3)
3. **Test all deep link patterns**
4. **Test authentication scenarios**
5. **Test error handling**
6. **Test performance**
7. **Test with real data**
8. **Document test results**

## 📱 **Step 10: Quick Reference Commands**

### **Essential ADB Commands**

```bash
# Check connected devices
adb devices

# Install APK
adb install app-debug.apk

# Uninstall app
adb uninstall com.globalrubber.hub

# Clear app data
adb shell pm clear com.globalrubber.hub

# Force stop app
adb shell am force-stop com.globalrubber.hub

# Test deep link
adb shell am start -W -a android.intent.action.VIEW -d "globalrubberhub://item/123" com.globalrubber.hub

# Monitor logs
adb logcat | findstr "DeepLink"
```

### **Quick Test Commands**

```bash
# Test all routes quickly
adb shell am start -W -a android.intent.action.VIEW -d "globalrubberhub://item/123" com.globalrubber.hub
adb shell am start -W -a android.intent.action.VIEW -d "globalrubberhub://profile/456" com.globalrubber.hub
adb shell am start -W -a android.intent.action.VIEW -d "globalrubberhub://item/add" com.globalrubber.hub

# Test universal links
adb shell am start -W -a android.intent.action.VIEW -d "https://globalrubberhub.com/item/123" com.globalrubber.hub

# Test with parameters
adb shell am start -W -a android.intent.action.VIEW -d "globalrubberhub://item/123?title=Test&category=natural" com.globalrubber.hub
```

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

---

**🎉 You're now ready to thoroughly test deep links on your PC before uploading to the Play Store!**
