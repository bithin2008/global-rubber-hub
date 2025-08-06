import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular/standalone';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { RazorpayService, PaymentPlan } from '../../services/razorpay.service';

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
    private razorpayService: RazorpayService
  ) {}

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
      const result = await this.razorpayService.processPayment(
        this.selectedPlan.id,
        this.userDetails
      );

      // Payment successful
      this.modalController.dismiss({
        success: true,
        data: result,
        plan: this.selectedPlan
      });

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

  // Test payment function for debugging (with auto-capture)
  testPayment() {
    console.log('🧪 Starting test payment from payment modal...');
    
    // First run troubleshooting to verify setup
    console.log('🔧 Running pre-test diagnostics...');
    
    if (!this.razorpayService.isRazorpayAvailable()) {
      console.error('❌ Razorpay not available, running troubleshooting...');
      this.razorpayService.troubleshootRazorpay();
      return;
    }
    
    console.log('✅ Razorpay is available, proceeding with test...');
    this.razorpayService.testPayment();
  }

  // Get current auto-capture status info
  getAutoCaptureInfo(): string {
    return 'Payments are automatically captured immediately upon successful transaction.';
  }

  calculateSavings(plan: PaymentPlan): number {
    if (!plan.originalPrice || !plan.discount) return 0;
    return plan.originalPrice - plan.amount;
  }
}