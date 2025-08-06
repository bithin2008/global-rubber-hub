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
      // Generate order ID from backend API
      const orderId = await this.generateOrderId(this.selectedPlan.amount);
      console.log('✅ Order ID generated:', orderId);

      // let url = "users/subscription";
      // this._commonService.post(url, data).subscribe(
      //   (response) => {
      //     this.enableLoader = false;
      //     console.log("response", response);
      //     // this.loading.dismiss();
      //     if (response.status == 1) {
  
      //       var options = {
      //         description: `Subcrption for ${object.duration} months`,
      //         image: "https://chhatrasathi.in:6002/razorpay-chhatrasathi-icon.png",
      //         currency: "INR", // your 3 letter currency code
      //         key: this.settingsObj.key_id, // your Key Id from Razorpay dashboard  //rzp_test_a3mI6L2qtvBXSF   //rzp_live_j32lzE3Haz8pZd
      //         order_id: response.result.orderId,
      //         amount: response.result.amount, // Payment amount in smallest denomiation e.g. cents for USD
      //         name: "CHHATRASATHI",
      //         prefill: {
      //           email: localStorage.getItem("email") ? localStorage.getItem("email") : 'chhatrasathi2020@gmail.com',
      //           contact: localStorage.getItem("mobile"),
      //           name: localStorage.getItem("name"),
      //         },
      //         theme: {
      //           color: "#621647",
      //         },
      //         modal: {
      //           ondismiss: function () {
      //             //  alert("dismissed");
      //           },
      //         },
      //       };
      //       var _this = this;
      //       var successCallback = function (success) {
      //         console.log("payment_id: ", success);
      //         _this.successPayment(success);
      //       };
      //       var cancelCallback = function (error) {
      //         //////////////////////
      //         //PASS ORDERID & ERROR OBJECT TO BACKEND
      //         /////////////////////
      //         console.log("description: ", error);
      //       };
      //       RazorpayCheckout.on("payment.success", successCallback);
      //       RazorpayCheckout.on("payment.cancel", cancelCallback);
      //       RazorpayCheckout.open(options);
      //     } else if (response.status == 401) {
      //       this.showToast('error', this.messsageObj.plan.invalidMessage[this.defaultLanguage], response.message, 3000, '/login')
      //     } else {
      //       this.showToast('error', this.messsageObj.plan.errorMessage[this.defaultLanguage], response.message, 5000, '')
      //     }
      //   },
      //   (error) => {
      //     this.enableLoader = false;
      //     console.log("error ts: ", error);
      //   }
      // );

   

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