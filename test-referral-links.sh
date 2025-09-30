#!/bin/bash

echo "Testing Referral System Deep Links"
echo "==================================="
echo

echo "Testing Custom Scheme Links:"
echo

echo "1. Testing referral deep link (Custom Scheme):"
echo "   globalrubberhub://referral/ABC123"
echo

echo "2. Testing referral deep link (Universal Link):"
echo "   https://globalrubberhub.com/referral/ABC123"
echo

echo "3. Testing referral with query parameter:"
echo "   https://globalrubberhub.com/register?referral=ABC123"
echo

echo "Android Testing Commands:"
echo "========================"
echo
echo "Test custom scheme:"
echo "adb shell am start -W -a android.intent.action.VIEW -d \"globalrubberhub://referral/ABC123\" com.globalrubber.hub"
echo
echo "Test universal link:"
echo "adb shell am start -W -a android.intent.action.VIEW -d \"https://globalrubberhub.com/referral/ABC123\" com.globalrubber.hub"
echo

echo "iOS Testing Commands:"
echo "===================="
echo
echo "Test custom scheme:"
echo "xcrun simctl openurl booted \"globalrubberhub://referral/ABC123\""
echo
echo "Test universal link:"
echo "xcrun simctl openurl booted \"https://globalrubberhub.com/referral/ABC123\""
echo

echo "Web Testing:"
echo "==========="
echo
echo "Open in browser:"
echo "https://globalrubberhub.com/referral/ABC123"
echo

echo "Press Enter to exit..."
read
