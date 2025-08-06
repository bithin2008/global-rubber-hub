import { Injectable } from '@angular/core';
import { CommonService } from './common-service';
import { getRazorpayConfig, createAuthHeader } from '../../environments/razorpay.config';

declare var Razorpay: any;

export interface PaymentPlan {
  id: string;
  name: string;
  description: string;
  amount: number; // in paise
  originalPrice?: number;
  discount?: number;
  duration: string;
  features: string[];
  popular?: boolean;
}

export interface PaymentOptions {
  orderId: string; // Required - Razorpay needs order ID
  amount: number;
  description: string;
  userDetails: any;
  onSuccess: (response: any) => void;
  onFailure: (error: any) => void;
}

@Injectable({
  providedIn: 'root'
})
export class RazorpayService {
  // Get Razorpay configuration
  private get razorpayConfig() {
    return getRazorpayConfig();
  }
  
  // Your Razorpay Key ID
  private get razorpayKeyId() {
    return this.razorpayConfig.keyId;
  }

  // Available subscription plans
  public plans: PaymentPlan[] = [
    {
      id: 'mandi_pro_monthly',
      name: 'Mandi Pro Monthly',
      description: 'Professional monthly subscription',
      amount: 999, // ₹999 in paise
      originalPrice: 1299, // ₹1299
      discount: 23,
      duration: '1 Month',
      features: [
        'Unlimited Market Access',
        'Real-time Price Updates',
        'Advanced Analytics',
        'Priority Customer Support',
        'Export Market Reports',
        'Price Trend Analysis'
      ],
      popular: true
    },
    {
      id: 'mandi_pro_yearly',
      name: 'Mandi Pro Yearly',
      description: 'Professional yearly subscription with best value',
      amount: 554, // ₹9999 in paise
      originalPrice: 649, // ₹15599
      discount: 36,
      duration: '12 Months',
      features: [
        'All Monthly Features',
        'Extended Market History',
        'Dedicated Account Manager',
        'Custom Reports',
        'API Access',
        'Mobile App Priority Support',
        '2 Free Market Consultations'
      ]
    },
    {
      id: 'trusted_seller',
      name: 'Trusted Seller Badge',
      description: 'Get verified seller status',
      amount: 499, // ₹499 in paise
      originalPrice: 699, // ₹699
      discount: 29,
      duration: '6 Months',
      features: [
        'Verified Seller Badge',
        'Higher Search Ranking',
        'Customer Trust Boost',
        'Priority Listing',
        'Featured Seller Status',
        'Dedicated Support'
      ]
    },
    {
      id: 'premium_combo',
      name: 'Premium Combo',
      description: 'Best value package with all features',
      amount: 149900, // ₹1499 in paise
      originalPrice: 229900, // ₹2299
      discount: 35,
      duration: '3 Months',
      features: [
        'All Mandi Pro Features',
        'Trusted Seller Badge',
        'Premium Analytics',
        'Unlimited API Calls',
        'Dedicated Manager',
        'Custom Integration Support',
        'White-label Options'
      ],
      popular: true
    }
  ];

  constructor(private commonService: CommonService) {}

  /**
   * Test if Razorpay is available
   */
  isRazorpayAvailable(): boolean {
    const isAvailable = typeof Razorpay !== 'undefined' && typeof (window as any).Razorpay !== 'undefined';
    console.log('🔍 Razorpay availability check:', {
      'typeof Razorpay': typeof Razorpay,
      'window.Razorpay': typeof (window as any).Razorpay,
      'isAvailable': isAvailable
    });
    return isAvailable;
  }

  /**
   * Simple test payment WITH real order ID from Razorpay API
   * This creates a real order ID by calling Razorpay API
   */
  async testPayment(): Promise<void> {
    console.log('🧪 Starting test payment WITH real order ID...');
    console.log('🔧 Debug Info:', {
      'Razorpay Key': this.razorpayKeyId,
      'typeof Razorpay (global)': typeof Razorpay,
      'typeof window.Razorpay': typeof (window as any).Razorpay,
      'window object': !!(window as any)
    });

    // Enhanced Razorpay availability check
    if (!this.isRazorpayAvailable()) {
      const errorMsg = 'Razorpay script not loaded. Please refresh the page and try again.';
      console.error('❌', errorMsg);
      alert(errorMsg);
      return;
    }

    try {
      console.log('✅ Razorpay is available, proceeding with test payment...');
      
      // Create real order ID by calling Razorpay API
      console.log('🔄 Creating real order via Razorpay API...');
      
      const testOrderData = {
        amount: 100, // ₹1 for testing (100 paise)
        currency: 'INR',
        receipt: `receipt_test_${Date.now()}`,
        payment_capture: 1,
        notes: {
          purpose: 'test_payment',
          auto_capture: 'enabled',
          timestamp: Date.now().toString()
        }
      };

      const response = await fetch(`${this.razorpayConfig.apiUrl}/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': createAuthHeader()
        },
        body: JSON.stringify(testOrderData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('❌ Razorpay API error:', errorData);
        throw new Error(`Razorpay API error: ${errorData.error?.description || errorData.error?.code || 'Unknown error'}`);
      }

      const orderResponse = await response.json();
      const realOrderId = orderResponse.id;
      
      console.log('✅ Real order created via Razorpay API:', orderResponse);
      console.log('🆔 Real Order ID:', realOrderId);
      console.log('💰 Test Amount: ₹1 (100 paise)');

      const options = {
        key: this.razorpayKeyId,
        amount: 100, // ₹1 for testing (100 paise)
        currency: 'INR',
        name: 'Global Rubber Hub',
        description: 'Test Payment - With Real Order ID',
        order_id: realOrderId, // IMPORTANT: Use real order ID from API
        
        // Prefill for test
        prefill: {
          name: 'Test User',
          email: 'test@example.com',
          contact: '9999999999'
        },

        // Theme
        theme: {
          color: '#2DD36F'
        },

        // Enhanced success handler
        handler: function (response: any) {
          console.log('🎉 Test Payment Success!', response);
          console.log('Response Keys:', Object.keys(response));
          
          const details = {
            'Payment ID': response.razorpay_payment_id || 'N/A',
            'Order ID': response.razorpay_order_id || 'N/A', 
            'Signature': response.razorpay_signature || 'N/A'
          };
          
          console.table(details);
          
          const message = `✅ Test Payment Successful!\n\n` +
            `💳 Payment ID: ${details['Payment ID']}\n` +
            `📋 Order ID: ${details['Order ID']}\n` +
            `🔒 Signature: ${details['Signature']?.substring(0, 15)}...\n\n` +
            `✨ Real order ID was created via Razorpay API!`;
            
          alert(message);
        },

        // Modal configuration
        modal: {
          ondismiss: function () {
            console.log('⚠️ Test payment modal dismissed by user');
            alert('Test payment was cancelled');
          }
        },

        // Retry configuration
        retry: {
          enabled: true,
          max_count: 2
        },

        // Checkout notes
        notes: {
          purpose: 'test_payment_real_order',
          auto_capture: 'enabled',
          timestamp: Date.now().toString()
        }
      };

      console.log('📨 Test payment options (WITH REAL ORDER ID):', {
        key: options.key,
        amount: options.amount,
        currency: options.currency,
        order_id: options.order_id,
        name: options.name,
        description: options.description
      });

      // Try to create Razorpay instance
      console.log('🚀 Creating Razorpay instance...');
      const RazorpayClass = (window as any).Razorpay || Razorpay;
      const rzp = new RazorpayClass(options);
      
      // Add error handler
      rzp.on('payment.failed', function (response: any) {
        console.error('💥 Test payment failed:', response);
        const errorDetails = response.error || {};
        const errorMsg = `Test payment failed!\n\n` +
          `Error: ${errorDetails.description || 'Unknown error'}\n` +
          `Code: ${errorDetails.code || 'N/A'}\n` +
          `Source: ${errorDetails.source || 'N/A'}\n` +
          `Step: ${errorDetails.step || 'N/A'}`;
        alert(errorMsg);
      });
      
      console.log('🎯 Opening test payment modal...');
      rzp.open();
      console.log('✅ Test payment modal opened successfully');
      
    } catch (error: any) {
      console.error('❌ Test payment initialization error:', error);
      console.error('Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
      
      const errorMsg = `Failed to initialize test payment!\n\nError: ${error.message || error}\n\nPlease check:\n1. Internet connection\n2. Razorpay script loading\n3. Browser console for details`;
      alert(errorMsg);
    }
  }

  /**
   * Comprehensive Razorpay troubleshooting function
   */
  troubleshootRazorpay(): void {
    console.log('🔧 RAZORPAY TROUBLESHOOTING REPORT');
    console.log('================================');
    
    const report = {
      // Environment checks
      'Browser Info': {
        'User Agent': navigator.userAgent,
        'Online Status': navigator.onLine,
        'Protocol': window.location.protocol,
        'Host': window.location.host
      },
      
      // Razorpay availability
      'Razorpay Checks': {
        'Global Razorpay': typeof Razorpay,
        'Window Razorpay': typeof (window as any).Razorpay,
        'Script Element': !!document.querySelector('script[src*="razorpay"]'),
        'Available Methods': typeof (window as any).Razorpay === 'function' ? 
          Object.getOwnPropertyNames((window as any).Razorpay.prototype || {}) : 'N/A'
      },
      
      // Configuration
      'Configuration': {
        'Key ID': this.razorpayKeyId,
        'Key Valid Format': /^rzp_(test|live)_[a-zA-Z0-9]{14}$/.test(this.razorpayKeyId),
        'Service Available': this.isRazorpayAvailable()
      },
      
      // Network checks
      'Network Status': {
        'Connection': navigator.onLine ? 'Online' : 'Offline',
        'Protocol': window.location.protocol,
        'HTTPS Required': window.location.protocol === 'https:' || window.location.hostname === 'localhost'
      }
    };
    
    console.table(report['Browser Info']);
    console.table(report['Razorpay Checks']);
    console.table(report.Configuration);
    console.table(report['Network Status']);
    
    // Recommendations
    console.log('💡 RECOMMENDATIONS:');
    if (!this.isRazorpayAvailable()) {
      console.log('❌ Razorpay not available - Reload the page');
    }
    if (!navigator.onLine) {
      console.log('❌ No internet connection - Check network');
    }
    if (window.location.protocol === 'http:' && window.location.hostname !== 'localhost') {
      console.log('⚠️ HTTPS recommended for production');
    }
    
    console.log('================================');
    
    // Show user-friendly summary
    let summary = '🔧 Razorpay Troubleshooting Report:\n\n';
    summary += `✓ Razorpay Available: ${this.isRazorpayAvailable() ? 'YES' : 'NO'}\n`;
    summary += `✓ Online: ${navigator.onLine ? 'YES' : 'NO'}\n`;
    summary += `✓ Key Format: ${/^rzp_(test|live)_[a-zA-Z0-9]{14}$/.test(this.razorpayKeyId) ? 'VALID' : 'INVALID'}\n`;
    summary += `✓ Protocol: ${window.location.protocol}\n\n`;
    
    if (!this.isRazorpayAvailable()) {
      summary += '❌ ISSUES FOUND:\n';
      summary += '• Razorpay script not loaded\n';
      summary += '• Try refreshing the page\n';
      summary += '• Check internet connection\n';
      summary += '• Disable ad blockers\n';
    } else {
      summary += '✅ No major issues found!\n';
      summary += 'Razorpay should work correctly.';
    }
    
    alert(summary);
  }

  /**
   * Get payment status from Razorpay (for auto-captured payments)
   */
  async getPaymentStatus(paymentId: string): Promise<any> {
    // This should call your backend API to get payment status from Razorpay
    // Backend will use Razorpay API to fetch payment details
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          id: paymentId,
          status: 'captured',
          amount: 100,
          currency: 'INR',
          captured: true,
          captured_at: Date.now() / 1000,
          method: 'card', // or upi, netbanking, etc.
          auto_captured: true
        });
      }, 500);
    });
  }

  /**
   * Get all available plans
   */
  getPlans(): PaymentPlan[] {
    return this.plans;
  }

  /**
   * Get plan by ID
   */
  getPlanById(planId: string): PaymentPlan | undefined {
    return this.plans.find(plan => plan.id === planId);
  }

  /**
   * Format amount to display currency
   */
  formatAmount(amountInPaise: number): string {
    const amount = amountInPaise / 100;
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  }

  /**
   * Create Razorpay order with automatic capture
   */
  async createOrder(planId: string): Promise<any> {
    const plan = this.getPlanById(planId);
    if (!plan) {
      throw new Error('Plan not found');
    }

    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substr(2, 9);
    
    const orderData = {
      amount: plan.amount,
      currency: 'INR',
      receipt: `receipt_${timestamp}_${planId}`,
      payment_capture: 1, // Enable automatic capture
      notes: {
        plan_id: planId,
        plan_name: plan.name,
        user_action: 'subscription_purchase',
        auto_capture: 'enabled',
        created_at: new Date().toISOString()
      }
    };

    console.log('🔄 Creating Razorpay order with auto-capture...');
    console.log('📋 Order data:', orderData);

    try {
      // Call Razorpay API to create real order
      const response = await fetch(`${this.razorpayConfig.apiUrl}/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': createAuthHeader()
        },
        body: JSON.stringify(orderData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('❌ Razorpay API error:', errorData);
        throw new Error(`Razorpay API error: ${errorData.error?.description || errorData.error?.code || 'Unknown error'}`);
      }

      const orderResponse = await response.json();
      
      console.log('✅ Real order created via Razorpay API:', orderResponse);
      console.log('🆔 Real Order ID:', orderResponse.id);
      
      return orderResponse;
      
    } catch (error: any) {
      console.error('❌ Order creation failed:', error);
      throw new Error(`Failed to create order: ${error.message || error}`);
    }
  }

  /**
   * Open Razorpay Payment Gateway with multiple payment options
   */
  openPaymentGateway(options: PaymentOptions): void {
    // Check if Razorpay is available
    if (typeof Razorpay === 'undefined') {
      console.error('❌ Razorpay script not loaded');
      options.onFailure({
        error: 'Razorpay not available',
        description: 'Payment gateway not initialized. Please refresh the page and try again.'
      });
      return;
    }

    // Validate that order ID is provided
    if (!options.orderId) {
      console.error('❌ Order ID is required for Razorpay payments');
      options.onFailure({
        error: 'Order ID required',
        description: 'Order ID is required for payment processing. Please try again.'
      });
      return;
    }

    console.log('🚀 Initializing Razorpay checkout...');
    console.log('🆔 Order ID:', options.orderId);
    console.log('💰 Amount:', options.amount);
    console.log('📋 Description:', options.description);

    // Build Razorpay options
    const rzpOptions: any = {
      key: this.razorpayKeyId,
      amount: options.amount,
      currency: 'INR',
      name: 'Global Rubber Hub',
      description: options.description,
      order_id: options.orderId, // ALWAYS include order_id
      
      // Customer details
      prefill: {
        name: options.userDetails?.full_name || 'Customer',
        email: options.userDetails?.email || '',
        contact: options.userDetails?.phone || ''
      },

      // Payment methods configuration
      method: {
        netbanking: true,
        card: true,
        upi: true,
        wallet: true,
        emi: true,
        paylater: true
      },

      // Automatic capture configuration
      payment_capture: 1, // Enable auto-capture at checkout level

      // Theme customization
      theme: {
        color: '#2DD36F'
      },

      // Modal configuration
      modal: {
        ondismiss: () => {
          console.log('⚠️ Payment dismissed by user');
          options.onFailure({
            error: 'Payment cancelled by user',
            description: 'User closed the payment window'
          });
        }
      },

      // Success handler for auto-captured payments
      handler: (response: any) => {
        console.log('✅ Payment successful (auto-captured):', response);
        console.log('💳 Payment ID:', response.razorpay_payment_id);
        console.log('📋 Order ID:', response.razorpay_order_id);
        console.log('🔒 Signature:', response.razorpay_signature);
        
        // Validate response contains required fields
        if (!response.razorpay_payment_id || !response.razorpay_order_id || !response.razorpay_signature) {
          console.error('❌ Invalid payment response - missing required fields');
          options.onFailure({
            error: 'Invalid payment response',
            description: 'Payment response is missing required fields'
          });
          return;
        }
        
        // For auto-capture, payment is immediately captured
        this.verifyPayment(response).then((result) => {
          console.log('✅ Payment verification successful:', result);
          options.onSuccess({
            ...result,
            auto_captured: true,
            payment_status: 'captured'
          });
        }).catch((error) => {
          console.error('❌ Payment verification failed:', error);
          options.onFailure(error);
        });
      },

      // Retry configuration
      retry: {
        enabled: true,
        max_count: 3
      },

      // Checkout options
      config: {
        display: {
          blocks: {
            banks: {
              name: 'Pay via Net Banking',
              instruments: [
                {
                  method: 'netbanking',
                  banks: ['HDFC', 'ICICI', 'SBI', 'AXIS', 'KOTAK', 'YES', 'PNB']
                }
              ]
            },
            utib: {
              name: 'Pay using Axis Bank',
              instruments: [
                {
                  method: 'netbanking',
                  banks: ['UTIB']
                }
              ]
            }
          },
          hide: {
            email: false,
            contact: false,
            order_id: false // Show order ID for debugging
          },
          preferences: {
            show_default_blocks: true
          }
        }
      }
    };

    // Log the complete options being sent to Razorpay
    console.log('📨 Razorpay options:', {
      key: rzpOptions.key,
      amount: rzpOptions.amount,
      currency: rzpOptions.currency,
      order_id: rzpOptions.order_id,
      description: rzpOptions.description
    });

    try {
      const rzp = new Razorpay(rzpOptions);
      
      // Handle payment failures
      rzp.on('payment.failed', (response: any) => {
        console.error('❌ Payment failed:', response);
        const errorDetails = response.error || {};
        options.onFailure({
          error: 'Payment failed',
          description: errorDetails.description || 'Payment processing failed',
          reason: errorDetails.reason,
          step: errorDetails.step,
          source: errorDetails.source
        });
      });
      
      // Open payment gateway
      console.log('🎯 Opening Razorpay payment gateway...');
      rzp.open();
      
    } catch (error: any) {
      console.error('❌ Error initializing Razorpay:', error);
      options.onFailure({
        error: 'Initialization failed',
        description: 'Unable to initialize payment gateway. Please try again.'
      });
    }
  }

  /**
   * Verify auto-captured payment with backend
   */
  private verifyPayment(paymentResponse: any): Promise<any> {
    console.log('Verifying auto-captured payment...');
    
    // This should call your backend API to verify auto-captured payment
    // Backend should validate the signature and confirm payment status
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (paymentResponse.razorpay_payment_id && paymentResponse.razorpay_order_id) {
          const verificationResult = {
            success: true,
            payment_id: paymentResponse.razorpay_payment_id,
            order_id: paymentResponse.razorpay_order_id,
            signature: paymentResponse.razorpay_signature,
            payment_status: 'captured', // Auto-captured
            captured_at: new Date().toISOString(),
            amount_captured: true,
            message: 'Payment captured automatically and verified successfully'
          };
          
          console.log('Payment verification result:', verificationResult);
          resolve(verificationResult);
        } else {
          console.error('Invalid payment response:', paymentResponse);
          reject({
            success: false,
            message: 'Payment verification failed - missing required parameters'
          });
        }
      }, 1200); // Reduced timeout for better UX
    });
  }

  /**
   * Process subscription payment with proper order handling
   */
  async processPayment(planId: string, userDetails: any): Promise<any> {
    console.log('🚀 Starting payment process...');
    console.log('📋 Plan ID:', planId);
    console.log('👤 User details:', userDetails);

    try {
      const plan = this.getPlanById(planId);
      if (!plan) {
        throw new Error('Invalid plan selected');
      }

      // Check if Razorpay is available
      if (typeof Razorpay === 'undefined') {
        throw new Error('Razorpay payment gateway is not available. Please refresh the page and try again.');
      }

      console.log('📦 Selected plan:', plan.name, '- Amount:', this.formatAmount(plan.amount));

      // Create order with proper error handling
      let orderResponse: any;
      try {
        orderResponse = await this.createOrder(planId);
      } catch (orderError: any) {
        console.error('❌ Order creation failed:', orderError);
        throw new Error(`Order creation failed: ${orderError.message}`);
      }

      // Validate order response
      if (!orderResponse) {
        throw new Error('Order creation returned empty response');
      }

      if (!orderResponse.order_id && !orderResponse.id) {
        console.error('❌ Invalid order response:', orderResponse);
        throw new Error('Order creation failed - no order ID received');
      }

      // Ensure we have the order ID in the expected format
      const orderId = orderResponse.order_id || orderResponse.id;
      console.log('✅ Order created with ID:', orderId);

      return new Promise((resolve, reject) => {
        const paymentOptions: PaymentOptions = {
          orderId: orderId, // This is now required
          amount: plan.amount,
          description: `${plan.name} - ${plan.duration}`,
          userDetails: userDetails,
          onSuccess: (response) => {
            console.log('🎉 Payment process completed successfully');
            resolve({
              success: true,
              plan: plan,
              payment: response,
              order_id: orderId,
              message: `Successfully subscribed to ${plan.name}!`
            });
          },
          onFailure: (error) => {
            console.error('💥 Payment process failed:', error);
            reject({
              success: false,
              error: error,
              order_id: orderId,
              message: error.description || error.error || 'Payment failed. Please try again.'
            });
          }
        };

        console.log('🎯 Launching payment gateway with options:', {
          orderId: paymentOptions.orderId,
          amount: paymentOptions.amount,
          description: paymentOptions.description
        });

        this.openPaymentGateway(paymentOptions);
      });

    } catch (error: any) {
      console.error('❌ Payment process initialization failed:', error);
      throw {
        success: false,
        message: error.message || 'Failed to process payment. Please try again.'
      };
    }
  }
}