// BACKEND INTEGRATION EXAMPLE FOR RAZORPAY
// This file shows how to implement the backend endpoints required for Razorpay integration

/* 
==============================================
BACKEND API ENDPOINTS NEEDED
==============================================

1. POST /api/payments/create-order
2. POST /api/payments/verify
3. POST /api/webhooks/razorpay (optional but recommended)

==============================================
*/

// Example: Node.js/Express backend implementation
/*

const Razorpay = require('razorpay');
const crypto = require('crypto');

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: 'rzp_test_pukxv7Ki2WgVYL', // Your Razorpay Key ID
  key_secret: 'YOUR_RAZORPAY_SECRET_KEY' // Your Razorpay Secret Key
});

// 1. CREATE ORDER ENDPOINT
app.post('/api/payments/create-order', async (req, res) => {
  try {
    const { plan_id, amount, currency = 'INR' } = req.body;
    
    const options = {
      amount: amount, // amount in paise
      currency: currency,
      receipt: `receipt_${Date.now()}_${plan_id}`,
      payment_capture: 1, // Enable auto-capture
      notes: {
        plan_id: plan_id,
        user_id: req.user?.id, // If you have user authentication
        auto_capture: 'enabled'
      }
    };

    const order = await razorpay.orders.create(options);
    
    console.log('Order created:', order);
    
    res.json({
      success: true,
      order_id: order.id,
      amount: order.amount,
      currency: order.currency,
      receipt: order.receipt,
      status: order.status,
      payment_capture: order.payment_capture
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

// 2. VERIFY PAYMENT ENDPOINT
app.post('/api/payments/verify', async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      plan_id
    } = req.body;

    // Verify signature
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", "YOUR_RAZORPAY_SECRET_KEY")
      .update(body.toString())
      .digest("hex");

    if (expectedSignature === razorpay_signature) {
      // Payment is valid and auto-captured
      
      // Fetch payment details from Razorpay
      const payment = await razorpay.payments.fetch(razorpay_payment_id);
      
      console.log('Payment verified:', {
        id: payment.id,
        status: payment.status,
        amount: payment.amount,
        captured: payment.captured
      });
      
      // Update user subscription in your database
      // await updateUserSubscription(req.user.id, plan_id, payment);
      
      res.json({
        success: true,
        payment_id: razorpay_payment_id,
        order_id: razorpay_order_id,
        payment_status: payment.status,
        captured: payment.captured,
        amount: payment.amount,
        method: payment.method,
        auto_captured: true,
        message: 'Payment verified and subscription activated'
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

// 3. WEBHOOK ENDPOINT (Optional but recommended)
app.post('/api/webhooks/razorpay', async (req, res) => {
  try {
    const webhookBody = JSON.stringify(req.body);
    const webhookSignature = req.headers['x-razorpay-signature'];
    
    // Verify webhook signature
    const expectedSignature = crypto
      .createHmac('sha256', 'YOUR_WEBHOOK_SECRET')
      .update(webhookBody)
      .digest('hex');
    
    if (expectedSignature === webhookSignature) {
      const event = req.body;
      
      console.log('Webhook received:', event.event);
      
      switch (event.event) {
        case 'payment.captured':
          // Handle auto-captured payment
          const payment = event.payload.payment.entity;
          console.log('Payment auto-captured:', payment.id);
          // Update database, send confirmation emails, etc.
          break;
          
        case 'payment.failed':
          // Handle failed payment
          const failedPayment = event.payload.payment.entity;
          console.log('Payment failed:', failedPayment.id);
          break;
          
        default:
          console.log('Unhandled webhook event:', event.event);
      }
      
      res.status(200).json({ status: 'ok' });
    } else {
      res.status(400).json({ error: 'Invalid webhook signature' });
    }
    
  } catch (error) {
    console.error('Webhook processing failed:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

*/

// ==============================================
// ANGULAR SERVICE INTEGRATION
// ==============================================

/*
// Update your RazorpayService to use real backend APIs:

async createOrder(planId: string): Promise<any> {
  const plan = this.getPlanById(planId);
  if (!plan) {
    throw new Error('Plan not found');
  }

  const orderData = {
    plan_id: planId,
    amount: plan.amount,
    currency: 'INR'
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

private async verifyPayment(paymentResponse: any): Promise<any> {
  const verificationData = {
    razorpay_order_id: paymentResponse.razorpay_order_id,
    razorpay_payment_id: paymentResponse.razorpay_payment_id,
    razorpay_signature: paymentResponse.razorpay_signature,
    plan_id: this.currentPlanId // Store this during payment process
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

*/

export const BACKEND_INTEGRATION_NOTES = {
  IMPORTANT: [
    "Replace 'YOUR_RAZORPAY_SECRET_KEY' with your actual secret key",
    "Never expose secret keys in frontend code",
    "Implement proper user authentication",
    "Add database operations for subscription management",
    "Set up proper error logging",
    "Configure webhook endpoint in Razorpay dashboard"
  ],
  
  TESTING: [
    "Use test API keys for development",
    "Test with Razorpay test cards",
    "Verify webhook signatures",
    "Test payment failure scenarios",
    "Validate order creation and verification"
  ],
  
  PRODUCTION: [
    "Switch to live API keys",
    "Configure proper SSL certificates",
    "Set up monitoring and alerts",
    "Implement rate limiting",
    "Add comprehensive logging"
  ]
};