# 🧪 Razorpay Test Payment Troubleshooting Guide

## 🎯 **Quick Test Methods**

Your Razorpay integration now includes **THREE** different test methods:

### **Method 1: Payment Modal Test**
- **Location**: Payment modal (when subscribing)
- **Button**: "⚡ Test Auto-Capture (₹1)"
- **Features**: Full order flow + auto-capture + order ID validation

### **Method 2: Direct Test**  
- **Location**: Account page bottom
- **Button**: "🧪 Test Razorpay Direct (₹1)"
- **Features**: Direct Razorpay checkout (bypasses order creation)

### **Method 3: Service Test**
- **Location**: Browser console
- **Command**: `razorpayService.testPayment()`
- **Features**: Programmatic testing with detailed logging

---

## 🔧 **Common Issues & Solutions**

### **❌ Issue: "Razorpay script not loaded"**
**Symptoms:**
- Test buttons don't work
- Alert: "Razorpay script not loaded"
- Console error: `Razorpay is not defined`

**Solutions:**
1. **Refresh the page** (most common fix)
2. **Check internet connection**
3. **Disable ad blockers** (they often block payment scripts)
4. **Clear browser cache**
5. **Try incognito/private mode**

### **❌ Issue: "Payment Failed immediately"**
**Symptoms:**
- Modal opens but fails instantly
- No payment options shown
- Error about invalid key

**Solutions:**
1. **Verify Razorpay key**: `rzp_test_pukxv7Ki2WgVYL`
2. **Check browser console** for specific errors
3. **Run troubleshooting function** (see below)

### **❌ Issue: "Order ID not working"**
**Symptoms:**
- Payment succeeds but no order ID in response
- Order validation errors

**Solutions:**
1. **Use Method 2 (Direct Test)** - doesn't require order ID
2. **Check order creation logic** in `createOrder()` function
3. **Verify backend integration** (if using real backend)

---

## 🩺 **Built-in Troubleshooting**

### **Automatic Diagnostics**
The test payment functions now include automatic troubleshooting:

```typescript
// Runs automatically when test payment fails
razorpayService.troubleshootRazorpay();
```

**What it checks:**
- ✅ Razorpay script availability
- ✅ Network connection status
- ✅ API key format validation
- ✅ Browser compatibility
- ✅ HTTPS requirements

### **Manual Troubleshooting**
Open browser console and run:
```javascript
// Check Razorpay availability
console.log('Razorpay available:', typeof Razorpay !== 'undefined');

// Run full diagnostics
razorpayService.troubleshootRazorpay();

// Test direct payment
razorpayService.testPayment();
```

---

## 📱 **Testing Steps**

### **Step 1: Basic Availability Test**
1. Open browser console (F12)
2. Type: `typeof Razorpay`
3. **Expected**: `"function"` or `"object"`
4. **If "undefined"**: Refresh page, check network

### **Step 2: Service Availability Test**
1. In console: `typeof razorpayService`
2. **Expected**: `"object"`
3. **If error**: Check Angular app is loaded

### **Step 3: Test Payment Flow**
1. **Try Method 2 first** (Direct Test) - simplest
2. **If successful**: Try Method 1 (Full Flow)
3. **Check console logs** for detailed information

### **Step 4: Debug Mode**
Enable detailed logging:
```javascript
// In browser console
localStorage.setItem('razorpay-debug', 'true');
// Then try test payment
```

---

## 🎨 **Expected Test Flow**

### **Successful Test Payment:**
```
🧪 Starting test payment...
🔧 Debug Info: {Razorpay Key: "rzp_test_pukxv7Ki2WgVYL", ...}
✅ Razorpay is available, proceeding with test payment...
🆔 Test Order ID: order_test_1704110400000
💰 Test Amount: ₹1 (100 paise)
📨 Final test payment options: {...}
🚀 Creating Razorpay instance...
🎯 Opening test payment modal...
✅ Test payment modal opened successfully

[User completes payment]

🎉 Test Payment Success! {...}
✅ Test Payment Successful!
💳 Payment ID: pay_xyz123
📋 Order ID: order_test_1704110400000  
🔒 Signature: abc123def456...
✨ Auto-capture is working correctly!
```

### **Failed Test Payment:**
```
🧪 Starting test payment...
🔧 Debug Info: {...}
❌ Razorpay not available
🔧 RAZORPAY TROUBLESHOOTING REPORT
================================
[Detailed diagnostics table]
💡 RECOMMENDATIONS:
❌ Razorpay not available - Reload the page
```

---

## 🔍 **Console Debugging Commands**

```javascript
// Quick availability check
typeof Razorpay !== 'undefined'

// Detailed service check  
razorpayService.isRazorpayAvailable()

// Full troubleshooting report
razorpayService.troubleshootRazorpay()

// Test payment (with order ID)
razorpayService.testPayment()

// Check current configuration
console.log({
  key: 'rzp_test_pukxv7Ki2WgVYL',
  available: typeof Razorpay !== 'undefined',
  service: typeof razorpayService
})
```

---

## 🌐 **Browser Compatibility**

### **Supported Browsers:**
- ✅ Chrome 70+
- ✅ Firefox 65+
- ✅ Safari 12+
- ✅ Edge 79+

### **Required Conditions:**
- ✅ JavaScript enabled
- ✅ Internet connection
- ✅ Third-party scripts allowed
- ✅ Local storage enabled

---

## 📞 **Getting Help**

### **Console Logs to Share:**
When reporting issues, include:
1. **Troubleshooting report** output
2. **Browser console errors**
3. **Network tab** showing script loading
4. **Test payment logs**

### **Quick Health Check:**
```javascript
// Copy and paste this in console for instant health check
console.log('🏥 RAZORPAY HEALTH CHECK');
console.log('Razorpay Global:', typeof Razorpay);
console.log('Service Available:', typeof razorpayService);  
console.log('Test Key:', 'rzp_test_pukxv7Ki2WgVYL');
console.log('Online:', navigator.onLine);
console.log('Protocol:', location.protocol);
```

---

## 🎯 **Success Criteria**

✅ **Test payment is working when:**
- Modal opens without errors
- Payment options are displayed
- Test cards work (4111 1111 1111 1111)
- Success callback is triggered
- Console shows success logs
- Order ID is present in response

---

## 🚀 **Next Steps After Testing**

1. **Replace test key** with live key for production
2. **Implement backend APIs** for order creation/verification
3. **Add webhook handling** for auto-capture confirmations
4. **Test with real payment methods**
5. **Remove debug buttons** from production build

---

**💡 Remember: These are TEST payments using TEST keys. No real money is charged!**