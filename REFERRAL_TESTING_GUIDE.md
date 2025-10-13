# 🧪 Referral Code Testing Guide

## Testing Before Play Store Upload

### 1. 🌐 Web Browser Testing (Recommended)

#### Step 1: Start the Development Server
```bash
ionic serve
```

#### Step 2: Open Browser Console
- Press F12 or right-click → Inspect → Console
- Navigate to the login page and switch to register tab

#### Step 3: Test Referral Code Manually
```javascript
// Test setting referral code BA8597
testReferralCode("BA8597")

// Check what's stored
checkStoredCode()

// Check form initialization
testFormInit()

// Test referral service
await this.setReferrerCodeForTesting("BA8597")

// Force refresh
await this.refreshReferralCode()
```

#### Step 4: Verify Results
- Check if referral code appears in the form field
- Verify field is disabled
- Check for "✅ Referral code applied" message
- Monitor console logs for any errors

### 2. 📱 Android Emulator Testing

#### Step 1: Build for Android
```bash
ionic capacitor build android
```

#### Step 2: Open in Android Studio
```bash
ionic capacitor open android
```

#### Step 3: Test with ADB Commands
```bash
# Install the app
adb install platforms/android/app/build/outputs/apk/debug/app-debug.apk

# Test deep links
adb shell am start -W -a android.intent.action.VIEW -d "globalrubberhub://referral/BA8597" com.globalrubber.hub
```

### 3. 🔗 Deep Link Testing

#### Test Custom Scheme Links
```bash
# Test referral deep link
adb shell am start -W -a android.intent.action.VIEW -d "globalrubberhub://referral/BA8597" com.globalrubber.hub

# Test market deep link
adb shell am start -W -a android.intent.action.VIEW -d "globalrubberhub://market/TOKEN123" com.globalrubber.hub
```

#### Test Universal Links (Web)
```
https://globalrubberhub.com/referral/BA8597
```

### 4. 🧪 Automated Testing Scripts

#### Create Test Script
```javascript
// test-referral.js
async function testReferralFlow() {
    console.log('🧪 Testing Referral Flow...');
    
    // Test 1: Manual code setting
    console.log('Test 1: Manual code setting');
    testReferralCode("BA8597");
    
    // Test 2: Check stored code
    console.log('Test 2: Check stored code');
    await checkStoredCode();
    
    // Test 3: Form initialization
    console.log('Test 3: Form initialization');
    testFormInit();
    
    // Test 4: Service integration
    console.log('Test 4: Service integration');
    await this.setReferrerCodeForTesting("BA8597");
    
    console.log('✅ All tests completed!');
}

// Run tests
testReferralFlow();
```

### 5. 🔍 Debug Console Commands

#### Quick Test Commands
```javascript
// Set referral code
testReferralCode("BA8597")

// Check stored code
checkStoredCode()

// Check form
testFormInit()

// Test service
await this.setReferrerCodeForTesting("BA8597")

// Force refresh
await this.refreshReferralCode()

// Clear stored code
localStorage.removeItem('pending_referral_code')
```

### 6. 📊 Testing Checklist

#### ✅ Basic Functionality
- [ ] Referral code appears in form field
- [ ] Field is disabled when code is set
- [ ] "Referral code applied" message shows
- [ ] Console logs show successful operations

#### ✅ Edge Cases
- [ ] Test with different referral codes
- [ ] Test with empty/invalid codes
- [ ] Test form validation
- [ ] Test page refresh behavior

#### ✅ Integration Tests
- [ ] Deep link handling
- [ ] Service integration
- [ ] Form state management
- [ ] Event listeners

### 7. 🚀 Production Testing

#### Before Play Store Upload
1. **Remove debug code** from production build
2. **Test with real Play Store links**
3. **Verify referrer parameter capture**
4. **Test on actual devices**

#### Production Checklist
- [ ] Remove `forceSetReferralCodeForTesting()` calls
- [ ] Remove global testing methods
- [ ] Remove debug console logs
- [ ] Test with real Play Store URLs
- [ ] Verify on multiple devices

### 8. 🐛 Common Issues & Solutions

#### Issue: Referral code not appearing
**Solution**: Check console logs, verify form initialization

#### Issue: Field not disabled
**Solution**: Check `isReferralCodeFromUrl` flag

#### Issue: Service not storing code
**Solution**: Check localStorage, verify service methods

#### Issue: Deep links not working
**Solution**: Check app configuration, test with ADB

### 9. 📱 Device Testing

#### Android Device Testing
```bash
# Install debug APK
adb install app-debug.apk

# Test deep links
adb shell am start -W -a android.intent.action.VIEW -d "globalrubberhub://referral/BA8597" com.globalrubber.hub
```

#### iOS Device Testing (if applicable)
```bash
# Test with iOS simulator
xcrun simctl openurl booted "globalrubberhub://referral/BA8597"
```

### 10. 🔧 Development Tools

#### Browser DevTools
- Console for debugging
- Network tab for API calls
- Application tab for localStorage
- Sources tab for breakpoints

#### Android Studio
- Logcat for native logs
- Device File Explorer
- ADB commands
- Emulator testing

## 🎯 Quick Start Testing

1. **Run the app**: `ionic serve`
2. **Open console**: F12 → Console
3. **Navigate to login**: Go to login page → Register tab
4. **Test referral**: `testReferralCode("BA8597")`
5. **Verify result**: Check if code appears in form

This comprehensive testing approach ensures your referral functionality works perfectly before uploading to the Play Store! 🚀
