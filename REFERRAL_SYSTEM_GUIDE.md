# Referral System Implementation Guide

This guide explains the complete referral system implementation for the Global Rubber Hub Ionic app.

## Overview

The referral system allows users to:
- Generate unique referral codes
- Share referral links that automatically apply their code
- Track referral statistics and rewards
- Handle referral codes during app installation and registration

## Architecture

### Components

1. **ReferralService** (`src/app/services/referral.service.ts`)
   - Core referral logic and API integration
   - Handles referral code storage and retrieval
   - Manages referral link generation and sharing

2. **DeepLinkService** (Updated)
   - Enhanced to handle referral deep links
   - Processes `globalrubberhub://referral/CODE` URLs
   - Integrates with ReferralService

3. **App Component** (Updated)
   - Handles referral deep links on app launch
   - Routes referral codes to appropriate handlers

4. **Login/Register Pages** (Updated)
   - Include referral code input fields
   - Auto-populate referral codes from deep links
   - Send referral codes to backend during registration

5. **ReferralShareComponent** (New)
   - User interface for managing referral codes
   - Share referral links
   - View referral statistics

## Deep Link URLs

### Supported Referral URL Formats

1. **Universal Links (Web + App)**
   ```
   https://globalrubberhub.com/referral/ABC123
   ```

2. **Custom Scheme Links (App Only)**
   ```
   globalrubberhub://referral/ABC123
   ```

3. **Query Parameter Links**
   ```
   https://globalrubberhub.com/register?referral=ABC123
   ```

## Implementation Details

### 1. Referral Code Generation

```typescript
// Generate user's referral code
const referralCode = await this.referralService.generateUserReferralCode();
```

### 2. Referral Link Creation

```typescript
// Create universal link
const universalLink = this.referralService.createReferralLink('ABC123');
// Returns: https://globalrubberhub.com/referral/ABC123

// Create custom scheme link
const customLink = this.referralService.createCustomSchemeReferralLink('ABC123');
// Returns: globalrubberhub://referral/ABC123
```

### 3. Referral Code Handling

```typescript
// Handle referral code from deep link
await this.referralService.handleReferralCode('ABC123');
```

### 4. Referral Link Sharing

```typescript
// Share referral link
await this.referralService.shareReferralLink('ABC123');
```

## Backend API Endpoints

The following backend endpoints are required:

### 1. Generate Referral Code
```
GET /api/user/referral-code
```
**Response:**
```json
{
  "success": true,
  "referral_code": "ABC123"
}
```

### 2. Apply Referral Code
```
POST /api/user/apply-referral
```
**Request:**
```json
{
  "referral_code": "ABC123"
}
```
**Response:**
```json
{
  "success": true,
  "message": "Referral code applied successfully"
}
```

### 3. Registration with Referral
```
POST /api/auth/registration
```
**Request:**
```json
{
  "first_name": "John",
  "last_name": "Doe",
  "email": "john@example.com",
  "phone": "1234567890",
  "password": "password123",
  "referral_code": "ABC123"
}
```

### 4. Get Referral Statistics
```
GET /api/user/referral-stats
```
**Response:**
```json
{
  "success": true,
  "total_referrals": 5,
  "successful_referrals": 3,
  "rewards_earned": 150
}
```

## Usage Examples

### 1. User Shares Referral Link

```typescript
// In ReferralShareComponent
async shareReferralLink() {
  const referralCode = await this.referralService.generateUserReferralCode();
  await this.referralService.shareReferralLink(referralCode);
}
```

### 2. Handle Referral Deep Link

```typescript
// In AppComponent
App.addListener('appUrlOpen', (event: any) => {
  if (event.url.includes('referral/')) {
    const referralCode = event.url.split('referral/')[1];
    this.referralService.handleReferralCode(referralCode);
  }
});
```

### 3. Auto-populate Referral Code in Registration

```typescript
// In LoginPage/RegisterPage
async checkForReferralCode() {
  const storedCode = await this.referralService.getStoredReferralCode();
  if (storedCode) {
    this.registerForm.patchValue({ referralCode: storedCode });
  }
}
```

## Testing Referral Links

### 1. Android Testing

```bash
# Test custom scheme
adb shell am start -W -a android.intent.action.VIEW -d "globalrubberhub://referral/ABC123" com.globalrubber.hub

# Test universal link
adb shell am start -W -a android.intent.action.VIEW -d "https://globalrubberhub.com/referral/ABC123" com.globalrubber.hub
```

### 2. iOS Testing

```bash
# Test custom scheme
xcrun simctl openurl booted "globalrubberhub://referral/ABC123"

# Test universal link
xcrun simctl openurl booted "https://globalrubberhub.com/referral/ABC123"
```

### 3. Web Testing

```javascript
// Test in browser console
window.location.href = "https://globalrubberhub.com/referral/ABC123";
```

## Configuration

### 1. Update config.xml

The app is already configured with the necessary URL schemes:

```xml
<plugin name="cordova-plugin-customurlscheme" spec="^5.0.2">
    <variable name="URL_SCHEME" value="globalrubberhub" />
    <variable name="ANDROID_SCHEME" value="globalrubberhub" />
    <variable name="ANDROID_HOST" value="globalrubberhub.com" />
    <variable name="ANDROID_PATHPREFIX" value="/" />
</plugin>
```

### 2. Universal Links Configuration

Universal links are configured for iOS:

```xml
<config-file parent="com.apple.developer.associated-domains" target="*-Debug.plist">
    <array>
        <string>applinks:globalrubberhub.com</string>
    </array>
</config-file>
```

## Security Considerations

1. **Referral Code Validation**
   - Backend validates referral codes before applying
   - Prevents invalid or expired codes
   - Tracks referral code usage

2. **Deep Link Security**
   - Validate referral codes on the server
   - Implement rate limiting for referral applications
   - Log referral activities for audit

3. **User Privacy**
   - Store referral codes securely
   - Implement proper data retention policies
   - Comply with privacy regulations

## Troubleshooting

### Common Issues

1. **Referral Code Not Applied**
   - Check if user is logged in
   - Verify referral code format
   - Check backend API response

2. **Deep Links Not Working**
   - Verify URL scheme configuration
   - Check universal links setup
   - Test on different platforms

3. **Referral Statistics Not Loading**
   - Check API endpoint availability
   - Verify user authentication
   - Check network connectivity

### Debug Logging

Enable debug logging to troubleshoot issues:

```typescript
// In ReferralService
console.log('Referral code:', referralCode);
console.log('Stored referral code:', await this.getStoredReferralCode());
console.log('Referral stats:', await this.getReferralStats());
```

## Future Enhancements

1. **Referral Rewards System**
   - Implement reward tiers
   - Add reward redemption
   - Track reward history

2. **Advanced Analytics**
   - Referral conversion rates
   - Geographic referral data
   - Time-based referral patterns

3. **Social Sharing**
   - Social media integration
   - Custom sharing messages
   - Referral campaign management

## Support

For technical support or questions about the referral system implementation, please refer to the development team or create an issue in the project repository.
