# 🔨 Build Debug APK Guide

## 📋 Current Status

Your Ionic app has been built and synced with Android. Android Studio is now opening.

---

## 🚀 Method 1: Build Using Android Studio (RECOMMENDED)

Android Studio is now opening with your project. Follow these steps:

### **Step 1: Wait for Gradle Sync**
- Android Studio will automatically sync Gradle when it opens
- Wait for the sync to complete (check bottom status bar)
- This may take a few minutes on first open

### **Step 2: Build Debug APK**
1. In Android Studio menu, click **Build** → **Build Bundle(s) / APK(s)** → **Build APK(s)**
2. Wait for the build to complete
3. A notification will appear: "APK(s) generated successfully"
4. Click **locate** in the notification

### **Step 3: Find Your APK**
The debug APK will be located at:
```
d:\Global Rubber Hub\global-rubber-hub\android\app\build\outputs\apk\debug\app-debug.apk
```

---

## 🔧 Method 2: Build Using Command Line (Alternative)

If you prefer command line, you'll need to set up the Gradle wrapper first.

### **Option A: Generate Gradle Wrapper**

1. **Open PowerShell in the android directory:**
   ```powershell
   cd "d:\Global Rubber Hub\global-rubber-hub\android"
   ```

2. **Generate wrapper (if you have Gradle installed globally):**
   ```powershell
   gradle wrapper
   ```

3. **Then build:**
   ```powershell
   .\gradlew.bat assembleDebug
   ```

### **Option B: Use Android Studio's Gradle**

If Android Studio is installed, you can use its Gradle:

1. **Find Android Studio's Gradle path:**
   - Usually: `C:\Program Files\Android\Android Studio\gradle\gradle-X.X\bin\gradle.bat`

2. **Run build:**
   ```powershell
   & "C:\Program Files\Android\Android Studio\gradle\gradle-8.0\bin\gradle.bat" assembleDebug
   ```
   *(Adjust version number as needed)*

---

## 📦 Method 3: Use Ionic CLI (Simplest)

### **Build and Open in Android Studio:**
```bash
npm run build
npx cap sync android
npx cap open android
```

Then use Android Studio's Build menu as described in Method 1.

---

## 🎯 Quick Build Commands Summary

### **Complete Build Process:**
```bash
# 1. Build web assets
npm run build

# 2. Sync with Capacitor
npx cap sync android

# 3. Open in Android Studio
npx cap open android

# 4. In Android Studio: Build → Build Bundle(s) / APK(s) → Build APK(s)
```

---

## 📍 APK Location

After successful build, your debug APK will be at:

```
d:\Global Rubber Hub\global-rubber-hub\android\app\build\outputs\apk\debug\app-debug.apk
```

**File size:** Approximately 8-15 MB

---

## 📱 Install APK on Device

### **Method 1: Using ADB**
```bash
adb install "d:\Global Rubber Hub\global-rubber-hub\android\app\build\outputs\apk\debug\app-debug.apk"
```

### **Method 2: Transfer to Device**
1. Copy APK to your phone (via USB, email, cloud storage)
2. Open the APK file on your phone
3. Allow installation from unknown sources if prompted
4. Install the app

### **Method 3: Using Android Studio**
1. Connect your device via USB
2. Enable USB debugging on your device
3. In Android Studio, click the **Run** button (green play icon)
4. Select your device from the list

---

## 🐛 Troubleshooting

### **Issue: Gradle Sync Failed**

**Solution:**
1. In Android Studio: **File** → **Invalidate Caches / Restart**
2. Wait for Android Studio to restart
3. Let Gradle sync again

### **Issue: Build Failed - Missing Dependencies**

**Solution:**
1. Check Android Studio's **Build** output panel
2. Install any missing SDK components suggested
3. Retry the build

### **Issue: "SDK location not found"**

**Solution:**
1. Create `local.properties` file in `android/` directory
2. Add this line (adjust path to your SDK):
   ```
   sdk.dir=C\:\\Users\\YourUsername\\AppData\\Local\\Android\\Sdk
   ```

### **Issue: Out of Memory**

**Solution:**
1. Edit `android/gradle.properties`
2. Add or modify:
   ```
   org.gradle.jvmargs=-Xmx4096m -XX:MaxPermSize=512m -XX:+HeapDumpOnOutOfMemoryError -Dfile.encoding=UTF-8
   ```

---

## ✅ Build Success Indicators

You'll know the build succeeded when:

- ✅ Android Studio shows "BUILD SUCCESSFUL" in the Build output
- ✅ Notification appears: "APK(s) generated successfully"
- ✅ APK file exists at the output location
- ✅ APK file size is reasonable (8-15 MB)
- ✅ No error messages in the Build output

---

## 📊 Build Variants

### **Debug APK:**
- **Purpose:** Testing and development
- **Signing:** Signed with debug keystore
- **Optimization:** Not optimized
- **Size:** Larger
- **Location:** `app/build/outputs/apk/debug/app-debug.apk`

### **Release APK (for production):**
- **Purpose:** Production deployment
- **Signing:** Requires release keystore
- **Optimization:** Optimized and minified
- **Size:** Smaller
- **Build command:** `Build → Build Bundle(s) / APK(s) → Build APK(s)` (select release variant)

---

## 🔑 Signing Information

### **Debug Keystore (Auto-generated):**
- **Location:** `~/.android/debug.keystore`
- **Alias:** `androiddebugkey`
- **Password:** `android`
- **Used for:** Development and testing only

### **Release Keystore (Your custom keystore):**
- **Location:** `d:\Global Rubber Hub\global-rubber-hub\global-rubber-hub.keystore`
- **Used for:** Production releases
- **Configured in:** `android/app/build.gradle`

---

## 📝 Build Logs

### **View Build Logs in Android Studio:**
1. Click **Build** in the bottom panel
2. Review any errors or warnings
3. Check **Gradle Console** for detailed output

### **Common Build Output:**
```
> Task :app:assembleDebug
BUILD SUCCESSFUL in 1m 23s
142 actionable tasks: 142 executed
```

---

## 🚀 Next Steps After Build

1. **Test the APK:**
   - Install on a test device
   - Test all features including Google Sign-In
   - Check for crashes or errors

2. **Verify Google Sign-In:**
   - Make sure SHA-1 certificate matches Firebase configuration
   - Test sign-in flow
   - Check backend integration

3. **Monitor Logs:**
   ```bash
   adb logcat | findstr "chromium\|Firebase\|Google"
   ```

---

## 📞 Need Help?

### **If build fails:**
1. Check the **Build** output panel in Android Studio
2. Read error messages carefully
3. Search for the specific error online
4. Check `GOOGLE_SIGNIN_TESTING_GUIDE.md` for common issues

### **If APK installs but crashes:**
1. Check device logs: `adb logcat`
2. Verify all permissions in `AndroidManifest.xml`
3. Check `google-services.json` is in the correct location
4. Verify backend API is accessible

---

## 🎉 Success!

Once you have the APK:

✅ **app-debug.apk** is ready for testing  
✅ Install on Android devices  
✅ Test Google Sign-In functionality  
✅ Share with testers  
✅ Deploy to internal testing  

---

## 📋 Build Checklist

Before building:
- [ ] `npm run build` completed successfully
- [ ] `npx cap sync android` completed successfully
- [ ] `google-services.json` is in `android/app/` directory
- [ ] Android Studio is installed and updated
- [ ] Android SDK is installed

During build:
- [ ] Android Studio opened successfully
- [ ] Gradle sync completed without errors
- [ ] Build → Build APK(s) clicked
- [ ] Build completed successfully

After build:
- [ ] APK file exists at output location
- [ ] APK file size is reasonable
- [ ] APK installs on test device
- [ ] App launches without crashes
- [ ] Google Sign-In works correctly

---

**Last Updated:** 2025-12-30  
**Status:** ✅ Ready to Build  
**Next Step:** Use Android Studio to build the APK
