# Google Sign-In Testing Guide

## 🧪 Quick Testing Steps

### **Option 1: Test on Web Browser (Fastest)**

1. **Start the development server:**
   ```bash
   npm start
   ```

2. **Open browser:**
   - Navigate to `http://localhost:8100`
   - You should see the login page

3. **Test Google Sign-In:**
   - Click the "Sign in with Google" button
   - A popup window should open
   - Select your Google account
   - Grant permissions
   - You should be redirected to the dashboard

4. **Check console:**
   - Open browser DevTools (F12)
   - Look for any errors in the Console tab
   - Verify authentication logs

---

### **Option 2: Test on Android Device**

#### **Prerequisites:**
- Android device or emulator with Google Play Services
- USB debugging enabled (for physical device)
- Android Studio installed

#### **Steps:**

1. **Build the Android app:**
   ```bash
   npm run build
   npx cap sync android
   ```

2. **Open in Android Studio:**
   ```bash
   npx cap open android
   ```

3. **Connect your device:**
   - Connect Android device via USB
   - OR start Android emulator with Google Play

4. **Run the app:**
   - Click the green "Run" button in Android Studio
   - Select your device
   - Wait for app to install and launch

5. **Test Google Sign-In:**
   - Open the app on your device
   - Click "Sign in with Google"
   - Native Google account picker should appear
   - Select your Google account
   - You should be redirected to the dashboard

6. **Check logs:**
   - In Android Studio, open "Logcat"
   - Filter by "chromium" or "Firebase"
   - Look for authentication logs

---

### **Option 3: Build Debug APK**

1. **Build debug APK:**
   ```bash
   cd android
   ./gradlew assembleDebug
   ```
   
   Or on Windows:
   ```bash
   cd android
   gradlew.bat assembleDebug
   ```

2. **Find the APK:**
   - Location: `android/app/build/outputs/apk/debug/app-debug.apk`

3. **Install on device:**
   ```bash
   adb install android/app/build/outputs/apk/debug/app-debug.apk
   ```

4. **Test the app:**
   - Open the app on your device
   - Test Google Sign-In

---

## 🔍 What to Look For

### **Successful Sign-In:**
- ✅ Google account picker appears (native on Android, popup on web)
- ✅ User can select their account
- ✅ No error messages
- ✅ App navigates to dashboard
- ✅ User data is stored in localStorage
- ✅ Backend receives authentication request

### **Console Logs (Success):**
```
=== GOOGLE SIGN-IN DEBUG START ===
Platform check: { isCapacitor: true, ... }
Using SocialLogin for native mobile platform
Starting Google Sign-In Native with SocialLogin...
SocialLogin Response (full): { ... }
Firebase Sign-In Success: { ... }
Processed user info: { ... }
```

### **Common Success Indicators:**
- Token stored in localStorage
- User redirected to `/dashboard`
- No error toasts
- Backend returns 200/201 status code

---

## ❌ Common Issues & Solutions

### **Issue 1: Error Code 10 (DEVELOPER_ERROR)**

**Symptoms:**
- Error message: "Error 10" or "DEVELOPER_ERROR"
- Sign-in fails immediately

**Cause:**
- SHA-1 certificate fingerprint not added to Firebase/Google Cloud Console

**Solution:**

1. **Get your SHA-1 fingerprint:**

   For debug keystore:
   ```bash
   keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android
   ```

   For release keystore:
   ```bash
   keytool -list -v -keystore /path/to/your/release.keystore -alias your_alias
   ```

2. **Add SHA-1 to Firebase:**
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Select project: `global-rubber-hub-c754f`
   - Go to Project Settings → Your Android App
   - Scroll to "SHA certificate fingerprints"
   - Click "Add fingerprint"
   - Paste your SHA-1

3. **Add SHA-1 to Google Cloud Console:**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Navigate to APIs & Services → Credentials
   - Find your Android OAuth client
   - Add the SHA-1 fingerprint

4. **Download new google-services.json:**
   - From Firebase Console
   - Replace `android/app/google-services.json`

5. **Rebuild the app:**
   ```bash
   npx cap sync android
   ```

---

### **Issue 2: "Google Sign-In is not available"**

**Symptoms:**
- Error message about Google Sign-In not being available

**Cause:**
- Google Play Services not installed or outdated
- Testing on emulator without Google Play

**Solution:**
- Use a real Android device
- OR use an emulator with Google Play Services
- Update Google Play Services on device

---

### **Issue 3: Popup Blocked (Web)**

**Symptoms:**
- Nothing happens when clicking "Sign in with Google"
- Browser shows popup blocked notification

**Cause:**
- Browser popup blocker

**Solution:**
- Allow popups for localhost
- Check browser settings
- Try a different browser

---

### **Issue 4: Backend Authentication Fails**

**Symptoms:**
- Google Sign-In succeeds
- But app shows "Authentication failed" error
- Not redirected to dashboard

**Cause:**
- Backend API not configured
- Backend can't validate Firebase token
- Network error

**Solution:**

1. **Check backend endpoint:**
   - Verify `POST /api/v1/auth/google-login` exists
   - Check backend logs for errors

2. **Verify request payload:**
   - Open browser DevTools → Network tab
   - Look for the `google-login` request
   - Check the request payload

3. **Test backend directly:**
   ```bash
   curl -X POST https://globalrubberhub.com/api/v1/auth/google-login \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com","idToken":"test_token"}'
   ```

---

### **Issue 5: "Invalid webClientId"**

**Symptoms:**
- Error about invalid or missing webClientId

**Cause:**
- Wrong client ID in environment.ts
- Using Android client ID instead of Web client ID

**Solution:**

1. **Verify environment.ts:**
   ```typescript
   webClientId: '826183488369-itvh47edlesonfsq06vrgphvmkpf70ja.apps.googleusercontent.com'
   ```

2. **Get correct Web Client ID:**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Navigate to APIs & Services → Credentials
   - Find "Web client" (not Android client)
   - Copy the Client ID

---

## 📊 Testing Checklist

### **Pre-Testing:**
- [ ] `google-services.json` is in `android/app/` directory
- [ ] Environment variables are configured
- [ ] Dependencies are installed (`npm install`)
- [ ] Backend API is running and accessible

### **Web Testing:**
- [ ] App loads in browser
- [ ] Login page displays correctly
- [ ] Google Sign-In button is visible
- [ ] Clicking button opens popup
- [ ] Can select Google account
- [ ] Popup closes after selection
- [ ] App redirects to dashboard
- [ ] No console errors

### **Android Testing:**
- [ ] App installs successfully
- [ ] App opens without crashes
- [ ] Login page displays correctly
- [ ] Google Sign-In button is visible
- [ ] Clicking button shows native account picker
- [ ] Can select Google account
- [ ] Account picker closes after selection
- [ ] App redirects to dashboard
- [ ] No logcat errors

### **Backend Testing:**
- [ ] Backend receives authentication request
- [ ] Backend validates Firebase token
- [ ] Backend creates/updates user account
- [ ] Backend returns access token
- [ ] Token is stored in app

---

## 🛠️ Debug Commands

### **Check package installation:**
```bash
npm list @capgo/capacitor-social-login
npm list firebase
npm list @angular/fire
```

### **View Android logs:**
```bash
adb logcat | grep -i "google\|firebase\|auth"
```

### **Clear app data (Android):**
```bash
adb shell pm clear com.globalrubber.hub
```

### **Reinstall app:**
```bash
adb uninstall com.globalrubber.hub
adb install android/app/build/outputs/apk/debug/app-debug.apk
```

---

## 📱 Test Accounts

For testing, you can use:
- Your personal Google account
- A test Google account created specifically for this app
- Google Test accounts (if configured in Google Cloud Console)

**Note:** Make sure test accounts have access to the app in Google Cloud Console.

---

## 🎯 Expected Behavior

### **Web Flow:**
1. Click "Sign in with Google"
2. Popup opens with Google sign-in page
3. Select account or enter credentials
4. Grant permissions (first time only)
5. Popup closes
6. App shows loading indicator
7. Success toast appears
8. Navigate to dashboard

### **Android Flow:**
1. Click "Sign in with Google"
2. Native account picker appears
3. Select Google account
4. Grant permissions (first time only)
5. Account picker closes
6. App shows loading indicator
7. Success toast appears
8. Navigate to dashboard

---

## 📞 Support

If you encounter issues not covered in this guide:

1. Check the main implementation summary: `GOOGLE_SIGNIN_IMPLEMENTATION_SUMMARY.md`
2. Review Firebase console for any configuration issues
3. Check Google Cloud Console credentials
4. Review backend API logs
5. Enable verbose logging in the app

---

## 🎉 Success!

If all tests pass, your Google Sign-In is working correctly! 

Users can now:
- ✅ Sign in with their Google account
- ✅ Skip manual registration
- ✅ Use their Google profile information
- ✅ Access the app quickly and securely
