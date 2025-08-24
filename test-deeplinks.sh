#!/bin/bash

# Deep Link Testing Script for Global Rubber Hub
# Usage: ./test-deeplinks.sh

echo "🔗 Global Rubber Hub Deep Link Testing Script"
echo "=============================================="

# Check if device is connected
if ! adb devices | grep -q "device$"; then
    echo "❌ No Android device connected. Please connect a device and enable USB debugging."
    exit 1
fi

echo "✅ Device connected: $(adb devices | grep 'device$' | head -1 | cut -f1)"
echo ""

# App package name
PACKAGE_NAME="com.globalrubber.hub"

# Check if app is installed
if ! adb shell pm list packages | grep -q "$PACKAGE_NAME"; then
    echo "❌ App not installed. Please install the app first."
    exit 1
fi

echo "✅ App is installed: $PACKAGE_NAME"
echo ""

# Function to test deep link
test_deep_link() {
    local scheme=$1
    local path=$2
    local description=$3
    
    echo "🧪 Testing: $description"
    echo "   URL: $scheme://$path"
    
    # Kill app first to test cold start
    adb shell am force-stop "$PACKAGE_NAME"
    sleep 2
    
    # Test deep link
    adb shell am start -W -a android.intent.action.VIEW -d "$scheme://$path" "$PACKAGE_NAME"
    
    echo "   ✅ Test completed"
    echo ""
    sleep 3
}

# Function to test universal link
test_universal_link() {
    local path=$1
    local description=$2
    
    echo "🌐 Testing Universal Link: $description"
    echo "   URL: https://globalrubberhub.com/$path"
    
    # Kill app first to test cold start
    adb shell am force-stop "$PACKAGE_NAME"
    sleep 2
    
    # Test universal link
    adb shell am start -W -a android.intent.action.VIEW -d "https://globalrubberhub.com/$path" "$PACKAGE_NAME"
    
    echo "   ✅ Test completed"
    echo ""
    sleep 3
}

# Test custom scheme deep links
echo "📱 Testing Custom Scheme Deep Links"
echo "-----------------------------------"

test_deep_link "globalrubberhub" "item/123" "Item Detail Page"
test_deep_link "globalrubberhub" "profile/456" "User Profile Page"
test_deep_link "globalrubberhub" "item/add" "Add Item Page"
test_deep_link "globalrubberhub" "bid/history" "Bid History Page"
test_deep_link "globalrubberhub" "bid/request" "Bid Request Page"
test_deep_link "globalrubberhub" "profile" "Profile Page"
test_deep_link "globalrubberhub" "account" "Account Page"
test_deep_link "globalrubberhub" "notification" "Notification Page"
test_deep_link "globalrubberhub" "verify" "Verify Page"
test_deep_link "globalrubberhub" "trusted-seller" "Trusted Seller Page"

# Test universal links
echo "🌐 Testing Universal Links"
echo "-------------------------"

test_universal_link "item/123" "Item Detail Page (Universal)"
test_universal_link "profile/456" "User Profile Page (Universal)"
test_universal_link "item/add" "Add Item Page (Universal)"

# Test with parameters
echo "🔧 Testing Deep Links with Parameters"
echo "-------------------------------------"

echo "🧪 Testing: Item with Parameters"
echo "   URL: globalrubberhub://item/123?title=Test%20Item&category=natural"

adb shell am force-stop "$PACKAGE_NAME"
sleep 2

adb shell am start -W -a android.intent.action.VIEW -d "globalrubberhub://item/123?title=Test%20Item&category=natural" "$PACKAGE_NAME"

echo "   ✅ Test completed"
echo ""

# Test authentication flow
echo "🔐 Testing Authentication Flow"
echo "------------------------------"

echo "🧪 Testing: Deep link when user not logged in"
echo "   URL: globalrubberhub://item/123"

# Clear app data to simulate fresh install
adb shell pm clear "$PACKAGE_NAME"
sleep 2

adb shell am start -W -a android.intent.action.VIEW -d "globalrubberhub://item/123" "$PACKAGE_NAME"

echo "   ✅ Test completed"
echo ""

# Test app state scenarios
echo "📱 Testing App State Scenarios"
echo "------------------------------"

echo "🧪 Testing: Deep link when app is in background"

# Start app and send to background
adb shell am start -n "$PACKAGE_NAME/.MainActivity"
sleep 3
adb shell input keyevent KEYCODE_HOME
sleep 2

# Test deep link
adb shell am start -W -a android.intent.action.VIEW -d "globalrubberhub://item/123" "$PACKAGE_NAME"

echo "   ✅ Test completed"
echo ""

echo "🧪 Testing: Deep link when app is already open"

# Test deep link without killing app
adb shell am start -W -a android.intent.action.VIEW -d "globalrubberhub://profile/456" "$PACKAGE_NAME"

echo "   ✅ Test completed"
echo ""

# Performance test
echo "⚡ Performance Testing"
echo "---------------------"

echo "🧪 Testing: Multiple rapid deep links"

for i in {1..5}; do
    echo "   Test $i/5: globalrubberhub://item/$i"
    adb shell am start -W -a android.intent.action.VIEW -d "globalrubberhub://item/$i" "$PACKAGE_NAME"
    sleep 1
done

echo "   ✅ Performance test completed"
echo ""

echo "🎉 Deep Link Testing Complete!"
echo "=============================="
echo ""
echo "📋 Next Steps:"
echo "1. Check the app behavior for each test"
echo "2. Verify navigation is correct"
echo "3. Check if parameters are passed correctly"
echo "4. Monitor console logs for any errors"
echo "5. Test on different devices if available"
echo ""
echo "📝 Notes:"
echo "- All tests assume the app is properly configured"
echo "- Some tests may require manual verification"
echo "- Check logs with: adb logcat | grep -E '(DeepLink|universalLinks)'"
echo ""
echo "🔗 For more information, see: PLAYSTORE_DEEPLINK_TESTING_GUIDE.md"
