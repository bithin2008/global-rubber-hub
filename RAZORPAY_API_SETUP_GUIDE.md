# 🔧 Razorpay API Setup Guide

## 🎯 **IMPORTANT: Configure Your Razorpay Secret Key**

Your Razorpay integration is now calling the real Razorpay API to create orders. You need to configure your secret key.

---

## 📋 **Step 1: Get Your Razorpay Secret Key**

1. **Login to Razorpay Dashboard**
   - Go to: https://dashboard.razorpay.com/
   - Login with your account

2. **Navigate to API Keys**
   - Go to **Settings** → **API Keys**
   - Or click on your profile → **API Keys**

3. **Copy Your Secret Key**
   - Find your **Test Secret Key** (starts with `sk_test_`)
   - **⚠️ Never share this key publicly**

---

## 🔧 **Step 2: Update Configuration**

### **Edit the configuration file:**
```typescript
// File: src/environments/razorpay.config.ts

export const razorpayConfig = {
  // Test Environment
  test: {
    keyId: 'rzp_test_pukxv7Ki2WgVYL', // ✅ Already configured
    secretKey: 'sk_test_YOUR_ACTUAL_SECRET_KEY_HERE', // 🔧 REPLACE THIS
    apiUrl: 'https://api.razorpay.com/v1'
  },
  
  // Production Environment
  production: {
    keyId: 'rzp_live_YOUR_LIVE_KEY_ID', // 🔧 Replace for production
    secretKey: 'sk_live_YOUR_LIVE_SECRET_KEY', // 🔧 Replace for production
    apiUrl: 'https://api.razorpay.com/v1'
  }
};
```

### **Replace the placeholder:**
```typescript
// Change this line:
secretKey: 'YOUR_RAZORPAY_SECRET_KEY', // Replace with your actual secret key

// To your actual secret key:
secretKey: 'sk_test_abc123def456ghi789', // Your actual secret key
```

---

## 🧪 **Step 3: Test the Integration**

### **Method 1: Direct Test**
1. Go to **Account page**
2. Click **"🧪 Test Razorpay Direct (₹1)"**
3. Should create real order via API and open payment modal

### **Method 2: Payment Modal Test**
1. Go to **Account page**
2. Click **"Subscribe"** on any plan
3. In payment modal, click **"⚡ Test Auto-Capture (₹1)"**

### **Method 3: Console Test**
```javascript
// Open browser console (F12) and run:
razorpayService.testPayment()
```

---

## 🔍 **Expected Flow:**

### **Successful API Call:**
```
🧪 Starting test payment WITH real order ID...
🔄 Creating real order via Razorpay API...
✅ Real order created via Razorpay API: {
  id: "order_abc123def456",
  entity: "order",
  amount: 100,
  currency: "INR",
  status: "created",
  ...
}
🆔 Real Order ID: order_abc123def456
📨 Test payment options (WITH REAL ORDER ID): {
  key: "rzp_test_pukxv7Ki2WgVYL",
  amount: 100,
  order_id: "order_abc123def456",
  ...
}
🚀 Creating Razorpay instance...
🎯 Opening test payment modal...
✅ Test payment modal opened successfully
```

### **API Error (if secret key is wrong):**
```
❌ Razorpay API error: {
  error: {
    code: "BAD_REQUEST_ERROR",
    description: "Invalid key id",
    ...
  }
}
```

---

## 🔒 **Security Notes:**

### **✅ DO:**
- Use test keys for development
- Use live keys only in production
- Keep secret keys secure
- Use environment variables in production

### **❌ DON'T:**
- Commit secret keys to version control
- Share secret keys publicly
- Use live keys in development
- Hardcode keys in frontend code (for production)

---

## 🚀 **Production Setup:**

### **For Production:**
1. **Get Live Keys** from Razorpay Dashboard
2. **Update Production Config:**
   ```typescript
   production: {
     keyId: 'rzp_live_YOUR_LIVE_KEY_ID',
     secretKey: 'sk_live_YOUR_LIVE_SECRET_KEY',
     apiUrl: 'https://api.razorpay.com/v1'
   }
   ```
3. **Use Environment Variables** (recommended)
4. **Test with Live Keys** in staging environment

---

## 🎯 **Next Steps:**

1. **✅ Configure Secret Key** (required)
2. **✅ Test API Integration** (verify it works)
3. **✅ Test Payment Flow** (complete payment)
4. **🔧 Add Webhook Handling** (for production)
5. **🔧 Implement Backend Verification** (for production)

---

## 📞 **Troubleshooting:**

### **"Invalid key id" Error:**
- Check your key ID is correct
- Ensure you're using test keys for development

### **"Invalid secret key" Error:**
- Verify your secret key is correct
- Check for extra spaces or characters

### **"API not accessible" Error:**
- Check internet connection
- Verify Razorpay API is accessible
- Check CORS settings

---

**💡 Once you configure your secret key, the Razorpay integration will create real orders via the API and process payments successfully!** 