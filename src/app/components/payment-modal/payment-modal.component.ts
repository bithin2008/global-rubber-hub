import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular/standalone';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { RazorpayService, PaymentPlan } from '../../services/razorpay.service';
import { CommonService } from '../../services/common-service';

@Component({
  selector: 'app-payment-modal',
  templateUrl: './payment-modal.component.html',
  styleUrls: ['./payment-modal.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule]
})
export class PaymentModalComponent implements OnInit {
  plans: PaymentPlan[] = [];
  selectedPlan: PaymentPlan | null = null;
  isProcessing: boolean = false;
  userDetails: any = {};

  // Payment method options
  paymentMethods = [
    { id: 'card', name: 'Credit/Debit Card', icon: 'card-outline', description: 'Visa, Mastercard, Rupay' },
    { id: 'upi', name: 'UPI', icon: 'phone-portrait-outline', description: 'Google Pay, PhonePe, Paytm' },
    { id: 'netbanking', name: 'Net Banking', icon: 'business-outline', description: 'All major banks' },
    { id: 'wallet', name: 'Wallets', icon: 'wallet-outline', description: 'Paytm, Mobikwik, Amazon Pay' },
    { id: 'emi', name: 'EMI', icon: 'card', description: 'No cost EMI available' }
  ];

  constructor(
    private modalController: ModalController,
    private razorpayService: RazorpayService,
    private commonService: CommonService
  ) { }

  ngOnInit() {
    this.plans = this.razorpayService.getPlans();
    this.selectedPlan = this.plans.find(plan => plan.popular) || this.plans[0];

    // Check if Razorpay is available
    if (!this.razorpayService.isRazorpayAvailable()) {
      console.error('Razorpay not available in payment modal');
    }
  }

  closeModal() {
    this.modalController.dismiss();
  }

  selectPlan(plan: PaymentPlan) {
    this.selectedPlan = plan;
  }

  formatAmount(amount: number): string {
    return this.razorpayService.formatAmount(amount);
  }

  async proceedToPay() {
    if (!this.selectedPlan) {
      return;
    }

    // Check if Razorpay is available
    if (!this.razorpayService.isRazorpayAvailable()) {
      this.modalController.dismiss({
        success: false,
        error: 'Razorpay payment gateway is not available. Please refresh the page and try again.'
      });
      return;
    }

    this.isProcessing = true;

    try {
      // Generate order ID from backend API
      const orderId = await this.generateOrderId(this.selectedPlan.amount);
      console.log('✅ Order ID generated:', orderId);

      // Get user details from local storage or service
      const userDetails = {
        name: 'Customer',
        email: 'customer@example.com',  // ✅ required
        contact: '9999999999'           // ✅ required
      };


      // Initialize Razorpay payment directly
      const options = {
        key: 'rzp_test_pukxv7Ki2WgVYL',
        amount: 100, // ₹1 for testing
        currency: 'INR',
        name: 'Global Rubber Hub',
        description: 'Test Payment',
        order_id: orderId,
        prefill: {
          name: userDetails.name,
          email: userDetails.email,
          contact: userDetails.contact
        },
        theme: {
          color: '#2DD36F'
        },
        handler: (response: any) => {
          console.log('🎉 Payment successful:', response);
          this.isProcessing = false;
          
          // Close modal with success response
          this.modalController.dismiss({
            success: true,
            plan: this.selectedPlan,
            payment: response,
            orderId: orderId,
            message: `Payment successful! Payment ID: ${response.razorpay_payment_id}`
          });
        },
        modal: {
          ondismiss: () => {
            console.log('⚠️ Payment dismissed by user');
            this.isProcessing = false;
            this.modalController.dismiss({
              success: false,
              error: 'Payment cancelled by user',
              orderId: orderId,
              message: 'Payment was cancelled'
            });
          }
        }
      };

      // Check if Razorpay is available
      if (typeof (window as any).Razorpay === 'undefined') {
        throw new Error('Razorpay is not loaded. Please refresh the page and try again.');
      }

      // Create and open Razorpay instance
      console.log('🚀 Opening Razorpay payment gateway...');
      const rzp = new (window as any).Razorpay(options);
      
      // Handle payment failures
      rzp.on('payment.failed', (response: any) => {
        console.error('❌ Payment failed:', response);
        this.isProcessing = false;
        this.modalController.dismiss({
          success: false,
          error: response.error,
          orderId: orderId,
          message: response.error?.description || 'Payment failed'
        });
      });
      
      rzp.open();

    } catch (error: any) {
      // Payment failed
      this.isProcessing = false;
      console.error('Payment error in modal:', error);
      this.modalController.dismiss({
        success: false,
        error: error.message || error.error || 'Payment failed. Please try again.'
      });
    }
  }

  /**
   * Generate order ID from backend API
   * @param amount - Payment amount in paise
   * @returns Promise<string> - Generated order ID
   */
  private async generateOrderId(amount: number): Promise<string> {
    try {
      console.log('🔄 Generating order ID for amount:', amount);

      const requestBody = {
        amount: amount,
        currency: "INR"
      };

      const response = await this.commonService.post(
        'general/generate-order-id',
        requestBody
      ).toPromise();

      console.log('✅ Order ID API response:', response);

      if (response && response.orderId) {
        return response.orderId;
      } else if (response && response.id) {
        return response.id;
      } else {
        throw new Error('Invalid order ID response from server');
      }

    } catch (error: any) {
      console.error('❌ Error generating order ID:', error);

      if (error.status === 404) {
        throw new Error('Order generation service not found. Please contact support.');
      } else if (error.status === 500) {
        throw new Error('Server error while generating order. Please try again.');
      } else if (error.status === 0) {
        throw new Error('Network error. Please check your internet connection.');
      } else {
        throw new Error(error.message || 'Failed to generate order ID. Please try again.');
      }
    }
  }




  // Get current auto-capture status info
  getAutoCaptureInfo(): string {
    return 'Payments are automatically captured immediately upon successful transaction.';
  }

  calculateSavings(plan: PaymentPlan): number {
    if (!plan.originalPrice || !plan.discount) return 0;
    return plan.originalPrice - plan.amount;
  }

  /**
   * Get user details from local storage or service
   */
  private async getUserDetails(): Promise<any> {
    try {
      // Try to get user details from local storage
      const userData = localStorage.getItem('userData');
      if (userData) {
        const user = JSON.parse(userData);
        return {
          full_name: user.full_name || user.name || 'Customer',
          email: user.email || '',
          phone: user.phone || user.contact || ''
        };
      }

      // Fallback to default values
      return {
        full_name: 'Customer',
        email: '',
        phone: ''
      };
    } catch (error) {
      console.error('Error getting user details:', error);
      return {
        full_name: 'Customer',
        email: '',
        phone: ''
      };
    }
  }
}