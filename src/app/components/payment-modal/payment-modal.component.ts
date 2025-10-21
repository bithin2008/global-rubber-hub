import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular/standalone';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { CommonService } from '../../services/common-service';
import { ActivatedRoute } from '@angular/router';
import { PageTitleService } from 'src/app/services/page-title.service';
import { ToastModalComponent } from 'src/app/toast-modal/toast-modal.component';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-payment-modal',
  templateUrl: './payment-modal.component.html',
  styleUrls: ['./payment-modal.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule]
})
export class PaymentModalComponent implements OnInit {
  public enableLoader: boolean = false;
  public packageList: any[] = [];
  public selectedPackage: any | null = null;
  public isProcessing: boolean = false;
  public profileDetails: any = {}
  userDetails: any = {};
  constructor(
    private commonService: CommonService,
    private activatedRoute: ActivatedRoute,
    private pageTitleService: PageTitleService,
    private modalController: ModalController
  ) {
    activatedRoute.params.subscribe(val => {
      this.pageTitleService.setPageTitle('Payment Seller');
      this.getPackageList();
    });
  }

  ngOnInit() {
   
  }

  getProfileData() {
    this.enableLoader = true;
    let url = 'user/profile';
    this.commonService.get(url).subscribe(
      (response: any) => {
        this.enableLoader = false;
        if (response.code == 200) {
          this.profileDetails = response.user;          
          // Update profile service with all data including wallet balance
        } else {
          this.showToast('error', response.message, '', 3500, '');
        }
      },
      (error) => {
        this.enableLoader = false;
        console.log('error ts: ', error.error);
        // this.toastr.error(error);
      }
    );

  }

  get totalWithGst(): number {
    const price = Number(this.selectedPackage?.price ?? 0);
    const tax = price * 0.18;
    return price + tax;
  }

  getPackageList() {
    let data = {
      package_for: 1
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

  selectPackage(pkg: any) {
    this.selectedPackage = pkg;
  }

  closeModal() {
    this.modalController.dismiss();
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

  async proceedToPay(){
    if (!this.selectedPackage) {
      return;
    }
    this.isProcessing = true;

    try {
      // Generate order ID from backend API
      const orderId = await this.generateOrderId(this.totalWithGst);
      console.log('✅ Order ID generated:', orderId);

      // Get user details from local storage or service
      const userDetails = {
        name: this.profileDetails.full_name,
        email: this.profileDetails.email,  // ✅ required
        contact: this.profileDetails.phone    // ✅ required
      };
      console.log("selectedPackage", this.selectedPackage);

      // Initialize Razorpay payment directly
      const options = {
        key: environment.Razor_Pay_KeyId,
        amount: this.totalWithGst * 100, // ₹1 for testing
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
          this.capturePayment(response)

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

  capturePayment(razorPay: any) {
    let url = "general/capture-payment";
    const price = Number(this.selectedPackage?.price ?? 0);
    const tax = price * 0.18;
    const total = price + tax;
    let data = {
      recharge_for: 1,
      razorpay_order_id: razorPay.razorpay_order_id,
      razorpay_payment_id: razorPay.razorpay_payment_id,
      razorpay_signature: razorPay.razorpay_signature,
      total_amount: total,
      package_amount: price,
     tax_amount: tax,
      package_id: this.selectedPackage.id
    }
    this.commonService.post(url, data).subscribe(
      (response) => {
        console.log("response", response);
        this.enableLoader = false;
        if (response.code == 200) {
          this.modalController.dismiss(response);
       // this.showToast('success', response.message, '', 2000, '/account');
        } else {
          this.showToast('error', response.message, '', 2000, '');
        }
      },
      (error) => {
        this.enableLoader = false;
        console.log("error ts: ", error);
      }
    );
  }

  async showToast(
    status: string,
    message: string,
    submessage: string,
    timer: number,
    redirect: string
  ) {
    const modal = await this.modalController.create({
      component: ToastModalComponent,
      cssClass: 'toast-modal',
      componentProps: {
        status: status,
        message: message,
        submessage: submessage,
        timer: timer,
        redirect: redirect
      }
    });
    return await modal.present();
  }
 




 

}