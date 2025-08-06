# 🔧 Razorpay Backend Integration Guide

## 🎯 **Current Status: Test Mode Working**

Your Razorpay integration is currently working in **TEST MODE** without requiring a backend. This allows you to test payments immediately.

---

## 🚀 **Two Payment Modes**

### **Mode 1: Test Mode (Current)**
- ✅ **No backend required**
- ✅ **No order ID needed**
- ✅ **Immediate testing possible**
- ✅ **Direct payment processing**

### **Mode 2: Production Mode (With Backend)**
- 🔧 **Requires backend integration**
- 🔧 **Real order creation**
- 🔧 **Proper signature verification**
- 🔧 **Webhook handling**

---

## 🔧 **Backend Integration Required**

To move to production, you need to implement these backend endpoints:

### **1. Create Order Endpoint**
```javascript
POST /api/payments/create-order
{
  "plan_id": "mandi_pro_monthly",
  "amount": 99900,
  "currency": "INR",
  "payment_capture": 1
}

Response:
{
  "success": true,
  "order_id": "order_abc123xyz",
  "amount": 99900,
  "currency": "INR",
  "status": "created"
}
```

### **2. Verify Payment Endpoint**
```javascript
POST /api/payments/verify
{
  "razorpay_order_id": "order_abc123xyz",
  "razorpay_payment_id": "pay_def456uvw",
  "razorpay_signature": "signature_hash"
}

Response:
{
  "success": true,
  "payment_status": "captured",
  "amount": 99900
}
```

---

## 📋 **Implementation Steps**

### **Step 1: Update Frontend Service**
Replace the mock order creation with real API calls:

```typescript
// In razorpay.service.ts
async createOrder(planId: string): Promise<any> {
  const plan = this.getPlanById(planId);
  if (!plan) {
    throw new Error('Plan not found');
  }

  const orderData = {
    plan_id: planId,
    amount: plan.amount,
    currency: 'INR',
    payment_capture: 1
  };

  try {
    // Call your backend API
    const response = await this.commonService.post('api/payments/create-order', orderData).toPromise();
    
    if (response.success) {
      console.log('✅ Order created:', response.order_id);
      return response;
    } else {
      throw new Error(response.message || 'Order creation failed');
    }
    
  } catch (error: any) {
    console.error('❌ Order creation failed:', error);
    throw new Error(`Failed to create order: ${error.message || error}`);
  }
}
```

### **Step 2: Update Payment Verification**
Replace mock verification with real API calls:

```typescript
private async verifyPayment(paymentResponse: any): Promise<any> {
  const verificationData = {
    razorpay_order_id: paymentResponse.razorpay_order_id,
    razorpay_payment_id: paymentResponse.razorpay_payment_id,
    razorpay_signature: paymentResponse.razorpay_signature
  };

  try {
    // Call your backend API
    const response = await this.commonService.post('api/payments/verify', verificationData).toPromise();
    
    if (response.success) {
      console.log('✅ Payment verified:', response);
      return response;
    } else {
      throw new Error(response.message || 'Payment verification failed');
    }
    
  } catch (error: any) {
    console.error('❌ Payment verification failed:', error);
    throw new Error(`Payment verification failed: ${error.message || error}`);
  }
}
```

### **Step 3: Update Payment Gateway**
Ensure order ID is always provided:

```typescript
// In openPaymentGateway method
if (!options.orderId) {
  console.error('❌ Order ID is required for production payments');
  options.onFailure({
    error: 'Order ID required',
    description: 'Order ID is required for payment processing.'
  });
  return;
}

rzpOptions.order_id = options.orderId; // Always include order ID
```

---

## 🛠️ **Backend Implementation (Node.js/Express)**

### **Install Dependencies**
```bash
npm install razorpay crypto
```

### **Backend Code**
```javascript
const Razorpay = require('razorpay');
const crypto = require('crypto');

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: 'rzp_test_pukxv7Ki2WgVYL', // Your test key
  key_secret: 'YOUR_RAZORPAY_SECRET_KEY' // Your secret key
});

// 1. Create Order
app.post('/api/payments/create-order', async (req, res) => {
  try {
    const { plan_id, amount, currency = 'INR' } = req.body;
    
    const options = {
      amount: amount,
      currency: currency,
      receipt: `receipt_${Date.now()}_${plan_id}`,
      payment_capture: 1, // Enable auto-capture
      notes: {
        plan_id: plan_id,
        user_id: req.user?.id,
        auto_capture: 'enabled'
      }
    };

    const order = await razorpay.orders.create(options);
    
    res.json({
      success: true,
      order_id: order.id,
      amount: order.amount,
      currency: order.currency,
      status: order.status
    });
    
  } catch (error) {
    console.error('Order creation failed:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create order',
      error: error.message
    });
  }
});

// 2. Verify Payment
app.post('/api/payments/verify', async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    } = req.body;

    // Verify signature
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", "YOUR_RAZORPAY_SECRET_KEY")
      .update(body.toString())
      .digest("hex");

    if (expectedSignature === razorpay_signature) {
      // Payment is valid
      res.json({
        success: true,
        payment_id: razorpay_payment_id,
        order_id: razorpay_order_id,
        payment_status: 'captured',
        message: 'Payment verified successfully'
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Invalid payment signature'
      });
    }
    
  } catch (error) {
    console.error('Payment verification failed:', error);
    res.status(500).json({
      success: false,
      message: 'Payment verification failed',
      error: error.message
    });
  }
});
```

---

## 🔄 **Migration Steps**

### **Phase 1: Test Mode (Current)**
✅ **Working** - No changes needed

### **Phase 2: Backend Development**
1. **Implement backend APIs** (create-order, verify)
2. **Test with real Razorpay orders**
3. **Add webhook handling**

### **Phase 3: Production Migration**
1. **Update frontend to use real APIs**
2. **Remove test mode fallbacks**
3. **Add proper error handling**
4. **Test with live keys**

---

## 🧪 **Testing Strategy**

### **Current Test Mode**
```javascript
// Test without backend
razorpayService.testPayment(); // Works immediately
```

### **Backend Test Mode**
```javascript
// Test with backend
const order = await razorpayService.createOrder('mandi_pro_monthly');
razorpayService.openPaymentGateway({
  orderId: order.order_id, // Real order ID
  amount: order.amount,
  description: 'Test with backend',
  userDetails: {},
  onSuccess: (response) => console.log('Success:', response),
  onFailure: (error) => console.error('Failed:', error)
});
```

---

## 🎯 **Next Steps**

1. **Keep current test mode** for immediate testing
2. **Develop backend APIs** for order creation/verification
3. **Test backend integration** with real orders
4. **Migrate to production mode** when ready
5. **Add webhook handling** for production

---

## 📞 **Support**

- **Test Mode Issues**: Check troubleshooting guide
- **Backend Integration**: Follow this guide
- **Production Issues**: Contact Razorpay support

---

**💡 Your current setup works perfectly for testing! Backend integration is only needed for production.** 