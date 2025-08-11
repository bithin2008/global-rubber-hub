import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar,ModalController} from '@ionic/angular/standalone';
import { HeaderComponent } from '../shared/header/header.component';
import { FooterComponent } from '../shared/footer/footer.component';
import { IonicModule } from '@ionic/angular';
import { CommonService } from '../services/common-service';
import { ActivatedRoute } from '@angular/router';
import { PageTitleService } from '../services/page-title.service';
import { RazorpayService } from '../services/razorpay.service';
@Component({
  selector: 'app-trusted-seller',
  templateUrl: './trusted-seller.page.html',
  styleUrls: ['./trusted-seller.page.scss'],
  standalone: true,
  imports: [IonicModule, FormsModule, CommonModule, HeaderComponent, FooterComponent]

})
export class TrustedSellerPage implements OnInit {
  public isPlanModalOpen: boolean = false;
  public enableLoader: boolean = false;
  public packageList: any[] = [];
  public selectedPackage: any | null = null;
  public isProcessing: boolean = false;
  constructor(
    private commonService: CommonService,
    private activatedRoute: ActivatedRoute,
    private pageTitleService: PageTitleService,
    private razorpayService: RazorpayService,
    private modalController: ModalController
  ) {
    activatedRoute.params.subscribe(val => {
      this.pageTitleService.setPageTitle('Trusted Seller');
      this.getPackageList();
    });
  }

  ngOnInit() {
  }

  openPlanModal() { this.isPlanModalOpen = true; }
  closePlanModal() { this.isPlanModalOpen = false; }
  selectPlan(pkg: any) { this.selectedPackage = pkg; }


  formatDuration(duration: number | string): string {
    const days = Number(duration);
    if (!Number.isFinite(days) || days <= 0) return '';
    const monthsFloat = days / 30;
    if (Number.isInteger(monthsFloat)) {
      const months = monthsFloat as number;
      if (months === 1) return 'MONTHLY';
      if (months % 12 === 0) {
        const years = months / 12;
        return years === 1 ? 'YEAR' : `${years} YEARS`;
      }
      return `${months} MONTHS`;
    }
    return `${days} DAYS`;
  }

  getPackageList() {
    let data = {
      package_for: 2
    }
    let url = `general/package-details`;
    this.commonService.post(url, data).subscribe(
      (response: any) => {
        this.enableLoader = false;
        if (response.code == 200) {
          this.packageList = response.results;
          if (this.packageList && this.packageList.length > 0) {
            this.selectedPackage = this.packageList[0];
          }
        }
      },
      (error) => {
        this.enableLoader = false;
        console.log('error', error);
      }
    );
  }

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

  async paySelectedPlan() {
    if (!this.selectedPackage) {
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
      const orderId = await this.generateOrderId(this.selectedPackage.price);
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
        amount: this.selectedPackage.price*100, // ₹1 for testing
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
            plan: this.selectedPackage,
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

}
