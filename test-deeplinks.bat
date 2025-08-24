@echo off
REM Deep Link Testing Script for Global Rubber Hub (Windows)
REM Usage: test-deeplinks.bat

echo 🔗 Global Rubber Hub Deep Link Testing Script
echo ==============================================

REM Check if device is connected
adb devices | findstr "device$" >nul
if errorlevel 1 (
    echo ❌ No Android device connected. Please connect a device and enable USB debugging.
    pause
    exit /b 1
)

for /f "tokens=1" %%i in ('adb devices ^| findstr "device$"') do set DEVICE_ID=%%i
echo ✅ Device connected: %DEVICE_ID%
echo.

REM App package name
set PACKAGE_NAME=com.globalrubber.hub

REM Check if app is installed
adb shell pm list packages | findstr "%PACKAGE_NAME%" >nul
if errorlevel 1 (
    echo ❌ App not installed. Please install the app first.
    pause
    exit /b 1
)

echo ✅ App is installed: %PACKAGE_NAME%
echo.

echo 📱 Testing Custom Scheme Deep Links
echo -----------------------------------

echo 🧪 Testing: Item Detail Page
echo    URL: globalrubberhub://item/123
adb shell am force-stop %PACKAGE_NAME%
timeout /t 2 /nobreak >nul
adb shell am start -W -a android.intent.action.VIEW -d "globalrubberhub://item/123" %PACKAGE_NAME%
echo    ✅ Test completed
echo.
timeout /t 3 /nobreak >nul

echo 🧪 Testing: User Profile Page
echo    URL: globalrubberhub://profile/456
adb shell am force-stop %PACKAGE_NAME%
timeout /t 2 /nobreak >nul
adb shell am start -W -a android.intent.action.VIEW -d "globalrubberhub://profile/456" %PACKAGE_NAME%
echo    ✅ Test completed
echo.
timeout /t 3 /nobreak >nul

echo 🧪 Testing: Add Item Page
echo    URL: globalrubberhub://item/add
adb shell am force-stop %PACKAGE_NAME%
timeout /t 2 /nobreak >nul
adb shell am start -W -a android.intent.action.VIEW -d "globalrubberhub://item/add" %PACKAGE_NAME%
echo    ✅ Test completed
echo.
timeout /t 3 /nobreak >nul

echo 🧪 Testing: Bid History Page
echo    URL: globalrubberhub://bid/history
adb shell am force-stop %PACKAGE_NAME%
timeout /t 2 /nobreak >nul
adb shell am start -W -a android.intent.action.VIEW -d "globalrubberhub://bid/history" %PACKAGE_NAME%
echo    ✅ Test completed
echo.
timeout /t 3 /nobreak >nul

echo 🧪 Testing: Bid Request Page
echo    URL: globalrubberhub://bid/request
adb shell am force-stop %PACKAGE_NAME%
timeout /t 2 /nobreak >nul
adb shell am start -W -a android.intent.action.VIEW -d "globalrubberhub://bid/request" %PACKAGE_NAME%
echo    ✅ Test completed
echo.
timeout /t 3 /nobreak >nul

echo 🧪 Testing: Profile Page
echo    URL: globalrubberhub://profile
adb shell am force-stop %PACKAGE_NAME%
timeout /t 2 /nobreak >nul
adb shell am start -W -a android.intent.action.VIEW -d "globalrubberhub://profile" %PACKAGE_NAME%
echo    ✅ Test completed
echo.
timeout /t 3 /nobreak >nul

echo 🧪 Testing: Account Page
echo    URL: globalrubberhub://account
adb shell am force-stop %PACKAGE_NAME%
timeout /t 2 /nobreak >nul
adb shell am start -W -a android.intent.action.VIEW -d "globalrubberhub://account" %PACKAGE_NAME%
echo    ✅ Test completed
echo.
timeout /t 3 /nobreak >nul

echo 🧪 Testing: Notification Page
echo    URL: globalrubberhub://notification
adb shell am force-stop %PACKAGE_NAME%
timeout /t 2 /nobreak >nul
adb shell am start -W -a android.intent.action.VIEW -d "globalrubberhub://notification" %PACKAGE_NAME%
echo    ✅ Test completed
echo.
timeout /t 3 /nobreak >nul

echo 🧪 Testing: Verify Page
echo    URL: globalrubberhub://verify
adb shell am force-stop %PACKAGE_NAME%
timeout /t 2 /nobreak >nul
adb shell am start -W -a android.intent.action.VIEW -d "globalrubberhub://verify" %PACKAGE_NAME%
echo    ✅ Test completed
echo.
timeout /t 3 /nobreak >nul

echo 🧪 Testing: Trusted Seller Page
echo    URL: globalrubberhub://trusted-seller
adb shell am force-stop %PACKAGE_NAME%
timeout /t 2 /nobreak >nul
adb shell am start -W -a android.intent.action.VIEW -d "globalrubberhub://trusted-seller" %PACKAGE_NAME%
echo    ✅ Test completed
echo.
timeout /t 3 /nobreak >nul

echo 🌐 Testing Universal Links
echo -------------------------

echo 🧪 Testing: Item Detail Page (Universal)
echo    URL: https://globalrubberhub.com/item/123
adb shell am force-stop %PACKAGE_NAME%
timeout /t 2 /nobreak >nul
adb shell am start -W -a android.intent.action.VIEW -d "https://globalrubberhub.com/item/123" %PACKAGE_NAME%
echo    ✅ Test completed
echo.
timeout /t 3 /nobreak >nul

echo 🧪 Testing: User Profile Page (Universal)
echo    URL: https://globalrubberhub.com/profile/456
adb shell am force-stop %PACKAGE_NAME%
timeout /t 2 /nobreak >nul
adb shell am start -W -a android.intent.action.VIEW -d "https://globalrubberhub.com/profile/456" %PACKAGE_NAME%
echo    ✅ Test completed
echo.
timeout /t 3 /nobreak >nul

echo 🧪 Testing: Add Item Page (Universal)
echo    URL: https://globalrubberhub.com/item/add
adb shell am force-stop %PACKAGE_NAME%
timeout /t 2 /nobreak >nul
adb shell am start -W -a android.intent.action.VIEW -d "https://globalrubberhub.com/item/add" %PACKAGE_NAME%
echo    ✅ Test completed
echo.
timeout /t 3 /nobreak >nul

echo 🔧 Testing Deep Links with Parameters
echo -------------------------------------

echo 🧪 Testing: Item with Parameters
echo    URL: globalrubberhub://item/123?title=Test%%20Item^&category=natural
adb shell am force-stop %PACKAGE_NAME%
timeout /t 2 /nobreak >nul
adb shell am start -W -a android.intent.action.VIEW -d "globalrubberhub://item/123?title=Test%%20Item^&category=natural" %PACKAGE_NAME%
echo    ✅ Test completed
echo.
timeout /t 3 /nobreak >nul

echo 🔐 Testing Authentication Flow
echo ------------------------------

echo 🧪 Testing: Deep link when user not logged in
echo    URL: globalrubberhub://item/123
adb shell pm clear %PACKAGE_NAME%
timeout /t 2 /nobreak >nul
adb shell am start -W -a android.intent.action.VIEW -d "globalrubberhub://item/123" %PACKAGE_NAME%
echo    ✅ Test completed
echo.
timeout /t 3 /nobreak >nul

echo 📱 Testing App State Scenarios
echo ------------------------------

echo 🧪 Testing: Deep link when app is in background
adb shell am start -n %PACKAGE_NAME%/.MainActivity
timeout /t 3 /nobreak >nul
adb shell input keyevent KEYCODE_HOME
timeout /t 2 /nobreak >nul
adb shell am start -W -a android.intent.action.VIEW -d "globalrubberhub://item/123" %PACKAGE_NAME%
echo    ✅ Test completed
echo.
timeout /t 3 /nobreak >nul

echo 🧪 Testing: Deep link when app is already open
adb shell am start -W -a android.intent.action.VIEW -d "globalrubberhub://profile/456" %PACKAGE_NAME%
echo    ✅ Test completed
echo.
timeout /t 3 /nobreak >nul

echo ⚡ Performance Testing
echo ---------------------

echo 🧪 Testing: Multiple rapid deep links
for /l %%i in (1,1,5) do (
    echo    Test %%i/5: globalrubberhub://item/%%i
    adb shell am start -W -a android.intent.action.VIEW -d "globalrubberhub://item/%%i" %PACKAGE_NAME%
    timeout /t 1 /nobreak >nul
)
echo    ✅ Performance test completed
echo.

echo 🎉 Deep Link Testing Complete!
echo ==============================
echo.
echo 📋 Next Steps:
echo 1. Check the app behavior for each test
echo 2. Verify navigation is correct
echo 3. Check if parameters are passed correctly
echo 4. Monitor console logs for any errors
echo 5. Test on different devices if available
echo.
echo 📝 Notes:
echo - All tests assume the app is properly configured
echo - Some tests may require manual verification
echo - Check logs with: adb logcat ^| findstr "DeepLink"
echo.
echo 🔗 For more information, see: PLAYSTORE_DEEPLINK_TESTING_GUIDE.md
echo.
pause
