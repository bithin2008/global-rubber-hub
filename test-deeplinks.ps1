# Deep Link Testing Script for Global Rubber Hub (PowerShell)
# Usage: .\test-deeplinks.ps1

Write-Host "🔗 Global Rubber Hub Deep Link Testing Script" -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host ""

# Check if device is connected
$devices = adb devices 2>$null | Select-String "device$"
if (-not $devices) {
    Write-Host "❌ No Android device connected. Please connect a device and enable USB debugging." -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

$deviceId = ($devices -split '\s+')[0]
Write-Host "✅ Device connected: $deviceId" -ForegroundColor Green
Write-Host ""

# App package name
$packageName = "com.globalrubber.hub"

# Check if app is installed
$appInstalled = adb shell pm list packages 2>$null | Select-String $packageName
if (-not $appInstalled) {
    Write-Host "❌ App not installed. Please install the app first." -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host "✅ App is installed: $packageName" -ForegroundColor Green
Write-Host ""

# Function to test deep link
function Test-DeepLink {
    param(
        [string]$Scheme,
        [string]$Path,
        [string]$Description
    )
    
    Write-Host "🧪 Testing: $Description" -ForegroundColor Yellow
    Write-Host "   URL: $Scheme://$Path" -ForegroundColor Gray
    
    # Kill app first to test cold start
    adb shell am force-stop $packageName 2>$null
    Start-Sleep -Seconds 2
    
    # Test deep link
    adb shell am start -W -a android.intent.action.VIEW -d "$Scheme://$Path" $packageName 2>$null
    
    Write-Host "   ✅ Test completed" -ForegroundColor Green
    Write-Host ""
    Start-Sleep -Seconds 3
}

# Function to test universal link
function Test-UniversalLink {
    param(
        [string]$Path,
        [string]$Description
    )
    
    Write-Host "🌐 Testing Universal Link: $Description" -ForegroundColor Yellow
    Write-Host "   URL: https://globalrubberhub.com/$Path" -ForegroundColor Gray
    
    # Kill app first to test cold start
    adb shell am force-stop $packageName 2>$null
    Start-Sleep -Seconds 2
    
    # Test universal link
    adb shell am start -W -a android.intent.action.VIEW -d "https://globalrubberhub.com/$Path" $packageName 2>$null
    
    Write-Host "   ✅ Test completed" -ForegroundColor Green
    Write-Host ""
    Start-Sleep -Seconds 3
}

# Test custom scheme deep links
Write-Host "📱 Testing Custom Scheme Deep Links" -ForegroundColor Cyan
Write-Host "-----------------------------------" -ForegroundColor Cyan

Test-DeepLink "globalrubberhub" "item/123" "Item Detail Page"
Test-DeepLink "globalrubberhub" "profile/456" "User Profile Page"
Test-DeepLink "globalrubberhub" "item/add" "Add Item Page"
Test-DeepLink "globalrubberhub" "bid/history" "Bid History Page"
Test-DeepLink "globalrubberhub" "bid/request" "Bid Request Page"
Test-DeepLink "globalrubberhub" "profile" "Profile Page"
Test-DeepLink "globalrubberhub" "account" "Account Page"
Test-DeepLink "globalrubberhub" "notification" "Notification Page"
Test-DeepLink "globalrubberhub" "verify" "Verify Page"
Test-DeepLink "globalrubberhub" "trusted-seller" "Trusted Seller Page"

# Test universal links
Write-Host "🌐 Testing Universal Links" -ForegroundColor Cyan
Write-Host "-------------------------" -ForegroundColor Cyan

Test-UniversalLink "item/123" "Item Detail Page (Universal)"
Test-UniversalLink "profile/456" "User Profile Page (Universal)"
Test-UniversalLink "item/add" "Add Item Page (Universal)"

# Test with parameters
Write-Host "🔧 Testing Deep Links with Parameters" -ForegroundColor Cyan
Write-Host "-------------------------------------" -ForegroundColor Cyan

Write-Host "🧪 Testing: Item with Parameters" -ForegroundColor Yellow
Write-Host "   URL: globalrubberhub://item/123?title=Test%20Item&category=natural" -ForegroundColor Gray

adb shell am force-stop $packageName 2>$null
Start-Sleep -Seconds 2

adb shell am start -W -a android.intent.action.VIEW -d "globalrubberhub://item/123?title=Test%20Item&category=natural" $packageName 2>$null

Write-Host "   ✅ Test completed" -ForegroundColor Green
Write-Host ""

# Test authentication flow
Write-Host "🔐 Testing Authentication Flow" -ForegroundColor Cyan
Write-Host "------------------------------" -ForegroundColor Cyan

Write-Host "🧪 Testing: Deep link when user not logged in" -ForegroundColor Yellow
Write-Host "   URL: globalrubberhub://item/123" -ForegroundColor Gray

# Clear app data to simulate fresh install
adb shell pm clear $packageName 2>$null
Start-Sleep -Seconds 2

adb shell am start -W -a android.intent.action.VIEW -d "globalrubberhub://item/123" $packageName 2>$null

Write-Host "   ✅ Test completed" -ForegroundColor Green
Write-Host ""

# Test app state scenarios
Write-Host "📱 Testing App State Scenarios" -ForegroundColor Cyan
Write-Host "------------------------------" -ForegroundColor Cyan

Write-Host "🧪 Testing: Deep link when app is in background" -ForegroundColor Yellow

# Start app and send to background
adb shell am start -n "$packageName/.MainActivity" 2>$null
Start-Sleep -Seconds 3
adb shell input keyevent KEYCODE_HOME 2>$null
Start-Sleep -Seconds 2

# Test deep link
adb shell am start -W -a android.intent.action.VIEW -d "globalrubberhub://item/123" $packageName 2>$null

Write-Host "   ✅ Test completed" -ForegroundColor Green
Write-Host ""

Write-Host "🧪 Testing: Deep link when app is already open" -ForegroundColor Yellow

# Test deep link without killing app
adb shell am start -W -a android.intent.action.VIEW -d "globalrubberhub://profile/456" $packageName 2>$null

Write-Host "   ✅ Test completed" -ForegroundColor Green
Write-Host ""

# Performance test
Write-Host "⚡ Performance Testing" -ForegroundColor Cyan
Write-Host "---------------------" -ForegroundColor Cyan

Write-Host "🧪 Testing: Multiple rapid deep links" -ForegroundColor Yellow

for ($i = 1; $i -le 5; $i++) {
    Write-Host "   Test $i/5: globalrubberhub://item/$i" -ForegroundColor Gray
    adb shell am start -W -a android.intent.action.VIEW -d "globalrubberhub://item/$i" $packageName 2>$null
    Start-Sleep -Seconds 1
}

Write-Host "   ✅ Performance test completed" -ForegroundColor Green
Write-Host ""

Write-Host "🎉 Deep Link Testing Complete!" -ForegroundColor Green
Write-Host "==============================" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Next Steps:" -ForegroundColor Cyan
Write-Host "1. Check the app behavior for each test" -ForegroundColor White
Write-Host "2. Verify navigation is correct" -ForegroundColor White
Write-Host "3. Check if parameters are passed correctly" -ForegroundColor White
Write-Host "4. Monitor console logs for any errors" -ForegroundColor White
Write-Host "5. Test on different devices if available" -ForegroundColor White
Write-Host ""
Write-Host "📝 Notes:" -ForegroundColor Cyan
Write-Host "- All tests assume the app is properly configured" -ForegroundColor White
Write-Host "- Some tests may require manual verification" -ForegroundColor White
Write-Host "- Check logs with: adb logcat | findstr 'DeepLink'" -ForegroundColor White
Write-Host ""
Write-Host "🔗 For more information, see: PC_DEEPLINK_TESTING_GUIDE.md" -ForegroundColor Cyan
Write-Host ""
Read-Host "Press Enter to exit"
