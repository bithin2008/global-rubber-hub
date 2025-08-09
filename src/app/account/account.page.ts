import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { IonButton, IonButtons, IonContent, IonHeader, IonTitle, AlertController, IonInput, ModalController, ActionSheetController, IonIcon, IonItem, IonLabel, IonSelect, IonSelectOption, IonBackButton, IonToolbar } from '@ionic/angular/standalone';

import { IonicModule } from '@ionic/angular';
import { CommonService } from '../services/common-service';
import { ToastModalComponent } from '../toast-modal/toast-modal.component';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { HeaderComponent } from '../shared/header/header.component';
import { FooterComponent } from '../shared/footer/footer.component';
import { ProfileService } from '../services/profile.service';
import { RazorpayService } from '../services/razorpay.service';
import { PaymentModalComponent } from '../components/payment-modal/payment-modal.component';
import { Subscription } from 'rxjs';
import { PageTitleService } from '../services/page-title.service';
import { getRazorpayConfig, createAuthHeader } from '../../environments/razorpay.config';
@Component({
  selector: 'app-account',
  templateUrl: './account.page.html',
  styleUrls: ['./account.page.scss'],
  standalone: true,
  imports: [ IonicModule, FormsModule, ReactiveFormsModule, CommonModule, HeaderComponent, FooterComponent ]
})
export class AccountPage implements OnInit, OnDestroy {
  public enableLoader: boolean = false;
  public profileImage: string = '';
  public showPlaceholder: boolean = true;
  public profileDetails:any={}
  private subscription: Subscription = new Subscription();


  constructor(public router: Router,
    private formBuilder: FormBuilder,
    private commonService: CommonService,
    activatedRoute: ActivatedRoute,
    public modalController: ModalController,
     private alertController: AlertController,
     private location: Location,
     private pageTitleService: PageTitleService,
     private profileService: ProfileService,
     private razorpayService: RazorpayService) { 
      activatedRoute.params.subscribe(val => { 
        this.pageTitleService.setPageTitle('Account');
        this.subscription.add(
          this.profileService.profileImage$.subscribe((imageUrl) => {
            this.profileImage = imageUrl;
            this.showPlaceholder = !imageUrl;
          })
        );
        this.getProfileData();
      });
     }

  ngOnInit() { 
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  getProfileData() {
    this.enableLoader = true;
    let url = 'user/profile';
    this.commonService.get(url).subscribe(
      (response: any) => {
        this.enableLoader = false;
        if (response.code == 200) {
          this.profileDetails=response.user;
          // Set profile image if available, otherwise show placeholder
          if (response.user.profile_image && response.user.profile_image.trim() !== '') {
            this.profileImage = response.user.profile_image;
            this.showPlaceholder = false;
            // Update the service so header reflects the change
            this.profileService.updateProfileImage(response.user.profile_image);
          } else {
            this.profileImage = '';
            this.showPlaceholder = true;
            // Clear the service as well
            this.profileService.updateProfileImage('');
          }
          // Update user name in service if available
          if (response.user.full_name) {
            this.profileService.updateUserName(response.user.full_name);
          }
         
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



  goToEditProfile(){
    this.router.navigate(['/profile']);
  }

  goBack() {
    this.location.back();
  }

  onImageError(event: Event) {
    this.profileImage = ''; // Clear the image source
    this.showPlaceholder = true; // Show placeholder
  }

  async confirmLogout() {
    const alert = await this.alertController.create({
      header: 'Logout',
      message: 'Are you sure?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'alert-cancel',
          handler: (blah:any) => {

          }
        }, {
          text: 'Ok',
          cssClass: 'alert-ok',
          handler: () => {
            this.logOut();
          }
        }
      ]
    });
    await alert.present();
  }

  logOut() {
   // this.enableLoader = true;
    let url = "user/logout";
    this.commonService.post(url, {}).subscribe((response:any) => {
      console.log('response', response);
   //   this.enableLoader = false;

      if (response.status == 200) {
        localStorage.setItem('token', '');
        this.showToast('success', response.message, '', 2000, '/login');
      } else {
        localStorage.setItem('token', '');
        this.showToast('success', response.message, '', 2000, '/login');
      }
    }, (error) => {
    //  this.enableLoader = false;
      console.log("error ts: ", error);
    });
  }

  // Open Payment Modal for subscription
  async openPaymentModal() {
    // Debug: Check if Razorpay is available
    console.log('Opening payment modal...');
    console.log('Razorpay available:', typeof (window as any).Razorpay !== 'undefined');
    console.log('Profile details:', this.profileDetails);

    // Check if Razorpay script is loaded
    if (typeof (window as any).Razorpay === 'undefined') {
      this.showToast(
        'error',
        'Payment Gateway Error',
        'Razorpay is not loaded. Please refresh the page and try again.',
        3000,
        ''
      );
      return;
    }

    const modal = await this.modalController.create({
      component: PaymentModalComponent,
      cssClass: 'payment-modal-class',
      componentProps: {
        userDetails: this.profileDetails
      }
    });

    modal.onDidDismiss().then((result) => {
      console.log('Payment modal dismissed with result:', result);
      if (result.data) {
        if (result.data.success) {
          // Payment successful
          this.showToast(
            'success',
            'Payment Successful!',
            `Successfully subscribed to ${result.data.plan?.name}`,
            4000,
            ''
          );
          // Refresh profile data to get updated subscription status
          this.getProfileData();
        } else {
          // Payment failed or cancelled
          console.error('Payment failed:', result.data.error);
          this.showToast(
            'error',
            'Payment Failed',
            result.data.error || 'Please try again',
            3000,
            ''
          );
        }
      }
    });

    return await modal.present();
  }

  // Handle Mandi Pro subscription
  onMandiProSubscribe() {
    this.openPaymentModal();
  }

  // Handle Trusted Seller subscription
  onTrustedSellerSubscribe() {
    this.openPaymentModal();
  }

  // Enhanced debug function to test Razorpay directly
  async testRazorpayDirect() {
    console.log('🧪 Testing Razorpay directly...');
    console.log('🔧 Environment Debug:', {
      'window.Razorpay': typeof (window as any).Razorpay,
      'navigator.onLine': navigator.onLine,
      'location.protocol': window.location.protocol,
      'profile': this.profileDetails
    });
    
    // Enhanced availability check
    if (typeof (window as any).Razorpay === 'undefined') {
      const errorMsg = '❌ Razorpay script not loaded.\n\nTroubleshooting:\n1. Check internet connection\n2. Refresh the page\n3. Disable ad blockers\n4. Check browser console for errors';
      console.error(errorMsg);
      alert(errorMsg);
      return;
    }

    try {
      console.log('✅ Razorpay is available, creating direct test payment...');
      
      // Create real order ID by calling Razorpay API
      console.log('🔄 Creating real order via Razorpay API...');
      
      const testOrderData = {
        amount: 100, // ₹1 for testing (100 paise)
        currency: 'INR',
        receipt: `receipt_direct_${Date.now()}`,
        payment_capture: 1,
        notes: {
          purpose: 'direct_test_payment',
          auto_capture: 'enabled',
          timestamp: Date.now().toString(),
          source: 'account_page'
        }
      };

      const response = await fetch(`${getRazorpayConfig().apiUrl}/orders`, {
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
      
      const options = {
        key: getRazorpayConfig().keyId,
        amount: 100, // ₹1 for testing
        currency: 'INR',
        name: 'Global Rubber Hub',
        description: 'Direct Test Payment (With Real Order ID)',
        order_id: realOrderId, // IMPORTANT: Use real order ID from API
        
        // Use profile data if available
        prefill: {
          name: this.profileDetails?.full_name || 'Direct Test User',
          email: this.profileDetails?.email || 'directtest@example.com',
          contact: this.profileDetails?.phone || '8888888888'
        },
        
        // Theme
        theme: {
          color: '#2DD36F'
        },
        
        // Enhanced success handler
        handler: function (response: any) {
          console.log('🎉 Direct test payment success:', response);
          console.log('📊 Response keys:', Object.keys(response));
          console.table({
            'Payment ID': response.razorpay_payment_id,
            'Order ID': response.razorpay_order_id,
            'Signature': response.razorpay_signature
          });
          
          const message = `✅ Direct Test Payment Successful!\n\n` +
            `💳 Payment ID: ${response.razorpay_payment_id}\n` +
            `📋 Order ID: ${response.razorpay_order_id}\n` +
            `🔒 Signature: ${response.razorpay_signature?.substring(0, 15)}...\n\n` +
            `🎯 Real order ID was created via Razorpay API!`;
          
          alert(message);
        },
        
        // Modal configuration
        modal: {
          ondismiss: function () {
            console.log('⚠️ Direct test payment dismissed by user');
            alert('Direct test payment was cancelled');
          }
        },
        
        // Notes for tracking
        notes: {
          test_type: 'direct_real_order',
          timestamp: Date.now().toString(),
          source: 'account_page'
        },
        
        // Retry configuration
        retry: {
          enabled: true,
          max_count: 2
        }
      };

      console.log('📨 Direct test options:', {
        key: options.key,
        amount: options.amount,
        order_id: options.order_id,
        description: options.description,
        prefill: options.prefill
      });

      console.log('🚀 Creating Razorpay instance for direct test...');
      const rzp = new (window as any).Razorpay(options);
      
      // Add payment failure handler
      rzp.on('payment.failed', function (response: any) {
        console.error('💥 Direct test payment failed:', response);
        const errorDetails = response.error || {};
        const errorMsg = `Direct test payment failed!\n\n` +
          `Error: ${errorDetails.description || 'Unknown error'}\n` +
          `Code: ${errorDetails.code || 'N/A'}\n` +
          `Source: ${errorDetails.source || 'N/A'}\n` +
          `Step: ${errorDetails.step || 'N/A'}`;
        alert(errorMsg);
      });
      
      console.log('🎯 Opening direct test payment modal...');
      rzp.open();
      console.log('✅ Direct test payment modal opened successfully');
      
    } catch (error: any) {
      console.error('❌ Direct test payment error:', error);
      console.error('Error stack:', error.stack);
      
      const errorMsg = `Failed to initialize direct test payment!\n\n` +
        `Error: ${error.message || error}\n` +
        `Type: ${error.name || 'Unknown'}\n\n` +
        `Check browser console for detailed error information.`;
      alert(errorMsg);
    }
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
