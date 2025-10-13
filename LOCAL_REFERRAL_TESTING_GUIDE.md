# 🧪 Local Referral Code Testing Guide

This guide explains how to test the referral code functionality locally during development.

## 🚀 Quick Start

### 1. Start Development Server
```bash
ionic serve
```
Your app will be available at: `http://localhost:4200`

### 2. Open Browser Console
- Press `F12` or right-click → Inspect → Console
- Navigate to the login page and switch to register tab

## 📋 Testing Methods

### Method 1: URL Parameter Testing (Easiest)

#### Test 1: Direct URL with Referral Code
Navigate to these URLs in your browser:

```
http://localhost:4200/register?referral=TEST123
http://localhost:4200/login?referral=ABC456
```

**Expected Results:**
- Referral code should appear in the form field
- Field should be disabled
- "✅ Referral code applied from your invitation link!" message should show

#### Test 2: Deep Link URLs
```
http://localhost:4200/referral/TEST123
http://localhost:4200/referral/ABC456
```

**Expected Results:**
- Should redirect to register page with referral code applied
- Referral code should be stored for later use

### Method 2: Browser Console Testing

#### Step 1: Open Console
1. Navigate to `http://localhost:4200/login`
2. Switch to register tab
3. Open browser console (F12)

#### Step 2: Test Referral Code Storage
```javascript
// Test setting a referral code
localStorage.setItem('pending_referral_code', 'TEST123');

// Check if it's stored
console.log('Stored code:', localStorage.getItem('pending_referral_code'));

// Clear storage
localStorage.removeItem('pending_referral_code');
```

#### Step 3: Test Referral Service Methods
```javascript
// Access the referral service (if available globally)
// Note: These methods may not be globally available after cleanup
// Use the URL parameter method instead
```

### Method 3: Manual Form Testing

#### Step 1: Navigate to Register Page
Go to `http://localhost:4200/register`

#### Step 2: Test Different Scenarios

**Scenario A: No Referral Code**
- Leave referral code field empty
- Fill other required fields
- Submit form
- Should work normally

**Scenario B: Manual Referral Code Entry**
- Enter a referral code manually (e.g., "MANUAL123")
- Fill other required fields
- Submit form
- Should include referral code in registration data

**Scenario C: URL Parameter Referral Code**
- Navigate to `http://localhost:4200/register?referral=URL123`
- Check if field is auto-populated and disabled
- Submit form
- Should include referral code in registration

### Method 4: Network Testing

#### Step 1: Open Network Tab
1. Open browser DevTools (F12)
2. Go to Network tab
3. Navigate to register page with referral code

#### Step 2: Monitor API Calls
1. Submit registration form
2. Check the registration API call
3. Verify `ref_code` parameter is included in the request

**Expected API Call:**
```json
{
  "first_name": "John",
  "last_name": "Doe",
  "email": "john@example.com",
  "phone": "1234567890",
  "ref_code": "TEST123",
  // ... other fields
}
```

## 🔍 Verification Steps

### 1. Check Console Logs
Look for these log messages:
```
✅ "Referral code from URL: TEST123"
✅ "Stored referral code found: TEST123"
✅ "Referral code applied from your invitation link!"
```

### 2. Check Form State
- Referral code field should be populated
- Field should be disabled (if from URL)
- Success message should appear

### 3. Check Network Requests
- Registration API call should include `ref_code` parameter
- Value should match the referral code you tested

### 4. Check Local Storage
```javascript
// Check what's stored
console.log('Pending referral:', localStorage.getItem('pending_referral_code'));
console.log('Referral used:', localStorage.getItem('referral_used'));
```

## 🐛 Common Issues & Solutions

### Issue 1: Referral Code Not Appearing
**Solution:**
- Check browser console for errors
- Verify URL parameter format: `?referral=CODE`
- Check if referral service is properly initialized

### Issue 2: Form Field Not Disabled
**Solution:**
- Ensure `isReferralCodeFromUrl` flag is set to `true`
- Check if referral code came from URL parameters

### Issue 3: API Call Missing Referral Code
**Solution:**
- Check if `ref_code` is included in form data
- Verify referral code is properly passed to registration API

### Issue 4: Deep Links Not Working
**Solution:**
- Use direct URL navigation instead of deep links for local testing
- Check if deep link service is properly configured

## 📱 Mobile Testing (Optional)

### Android Emulator
```bash
# Build for Android
ionic capacitor build android

# Open in Android Studio
ionic capacitor open android
```

### iOS Simulator
```bash
# Build for iOS
ionic capacitor build ios

# Open in Xcode
ionic capacitor open ios
```

## 🧪 Test Cases

### Test Case 1: URL Parameter Referral
1. Navigate to `http://localhost:4200/register?referral=URL123`
2. Verify referral code appears in form
3. Verify field is disabled
4. Submit form
5. Check API call includes `ref_code: "URL123"`

### Test Case 2: Deep Link Referral
1. Navigate to `http://localhost:4200/referral/DEEP456`
2. Verify redirects to register page
3. Verify referral code is applied
4. Submit form
5. Check API call includes `ref_code: "DEEP456"`

### Test Case 3: Manual Referral Entry
1. Navigate to `http://localhost:4200/register`
2. Enter referral code manually: "MANUAL789"
3. Submit form
4. Check API call includes `ref_code: "MANUAL789"`

### Test Case 4: No Referral Code
1. Navigate to `http://localhost:4200/register`
2. Leave referral code field empty
3. Submit form
4. Check API call has `ref_code: null`

## 🔧 Debugging Tools

### Console Commands
```javascript
// Check current URL
console.log('Current URL:', window.location.href);

// Check URL parameters
const urlParams = new URLSearchParams(window.location.search);
console.log('URL params:', Object.fromEntries(urlParams));

// Check local storage
console.log('All localStorage:', {...localStorage});

// Check form state
console.log('Form value:', document.querySelector('[formControlName="referralCode"]')?.value);
```

### Network Monitoring
1. Open DevTools → Network tab
2. Filter by "XHR" or "Fetch"
3. Submit registration form
4. Check the registration API call
5. Verify `ref_code` parameter is included

## 📝 Testing Checklist

- [ ] URL parameter referral codes work
- [ ] Deep link referral codes work
- [ ] Manual referral code entry works
- [ ] No referral code scenario works
- [ ] Form validation works correctly
- [ ] API calls include referral codes
- [ ] Console logs show proper flow
- [ ] Error handling works for invalid codes
- [ ] Local storage is managed correctly
- [ ] Form state updates properly

## 🚀 Production Testing

After local testing, test with:
1. **Play Store referrer codes** (when app is installed)
2. **Universal links** (https://globalrubberhub.com/referral/CODE)
3. **Custom scheme links** (globalrubberhub://referral/CODE)
4. **Real device testing** with actual referral links

---

**Note:** This guide focuses on local development testing. For production testing, refer to the main `REFERRAL_TESTING_GUIDE.md` file.
