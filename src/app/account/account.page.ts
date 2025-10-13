import { Component, OnInit, OnDestroy } from '@angular/core';
import { AuthGuardService } from '../services/auth-guard.service';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { IonButton, IonButtons, IonContent, IonHeader, IonTitle, AlertController, IonInput, ModalController, ActionSheetController, IonIcon, IonItem, IonLabel, IonSelect, IonSelectOption, IonBackButton, IonToolbar, Platform } from '@ionic/angular/standalone';

import { IonicModule } from '@ionic/angular';
import { CommonService } from '../services/common-service';
import { ToastModalComponent } from '../toast-modal/toast-modal.component';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { HeaderComponent } from '../shared/header/header.component';
import { FooterComponent } from '../shared/footer/footer.component';
import { ProfileService } from '../services/profile.service';
import { PaymentModalComponent } from '../components/payment-modal/payment-modal.component';
import { Subscription } from 'rxjs';
import { PageTitleService } from '../services/page-title.service';
import { getRazorpayConfig, createAuthHeader } from '../../environments/razorpay.config';
import { LoaderService } from '../services/loader.service';
// ReferralService removed - using simple localStorage approach
import { SocialShareModalComponent } from '../components/social-share-modal/social-share-modal.component';
@Component({
  selector: 'app-account',
  templateUrl: './account.page.html',
  styleUrls: ['./account.page.scss'],
  standalone: true,
  imports: [IonicModule, FormsModule, ReactiveFormsModule, CommonModule, HeaderComponent, FooterComponent]
})
export class AccountPage implements OnInit, OnDestroy {
  public profileImage: string = '';
  public showPlaceholder: boolean = true;
  public profileDetails: any = {}
  private subscription: Subscription = new Subscription();
  // Wallet recharge modal state
  public isWalletModalOpen: boolean = false;
  public walletAmount: number = 0;
  public isWalletProcessing: boolean = false;
  public checkExpiryDate: boolean = false;
  public checkExpiryDateMandiPro: boolean = false;
  public isProcessing: boolean = false;
  public packageList: any[] = [];
  public selectedPackage: any | null = null;
  constructor(public router: Router,
    private formBuilder: FormBuilder,
    private commonService: CommonService,
    activatedRoute: ActivatedRoute,
    public modalController: ModalController,
    private alertController: AlertController,
    private location: Location,
    private pageTitleService: PageTitleService,
    private profileService: ProfileService,
    private authGuardService: AuthGuardService,
    private loaderService: LoaderService,
    // ReferralService removed - using simple localStorage approach
    private platform: Platform) {
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

  async ngOnInit() {
    // Check authentication on component initialization
    await this.authGuardService.checkTokenAndAuthenticate();
  }

  get totalWithGst(): number {
    const price = Number(this.selectedPackage?.price ?? 0);
    const tax = price * 0.18;
    return price + tax;
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  getProfileData() {
    this.loaderService.show();
    let url = 'user/profile';
    this.commonService.get(url).subscribe(
      (response: any) => {
        this.loaderService.hide();
        if (response.code == 200) {
          this.profileDetails = response.user;
          this.profileDetails.points = parseInt(this.profileDetails.points)
          this.checkExpiryDate = this.profileDetails.trusted_package_expiry < new Date();
          this.checkExpiryDateMandiPro = this.profileDetails.pro_user_expiry < new Date();
          
          // Update profile service with all data including wallet balance
          this.profileService.updateProfileFromAPI(response.user);
          
          // Set profile image if available, otherwise show placeholder
          if (response.user.profile_image && response.user.profile_image.trim() !== '') {
            this.profileImage = response.user.profile_image;
            this.showPlaceholder = false;
          } else {
            this.profileImage = '';
            this.showPlaceholder = true;
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
        this.loaderService.hide();
        console.log('error ts: ', error.error);
        // this.toastr.error(error);
      }
    );

  }

  goToVerifyNow() {
    this.router.navigate(['/verify-now']);
  }


  goToEditProfile() {
    this.router.navigate(['/profile']);
  }

  goBack() {
    this.location.back();
  }

  onImageError(event: Event) {
    this.profileImage = ''; // Clear the image source
    this.showPlaceholder = true; // Show placeholder
  }

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

  // Wallet recharge actions
  openWalletModal() { this.isWalletModalOpen = true;  this.getPackageList();}
  closeWalletModal() { this.isWalletModalOpen = false; }
  quickAmount(amount: number) { this.walletAmount = amount; }
  selectPlan(pkg: any) { this.selectedPackage = pkg; }
  proceedWalletRecharge() {
    if (!this.walletAmount || this.walletAmount <= 0) { return; }
    // TODO: wire to payment flow (Razorpay) similar to payment modal
    this.isWalletProcessing = true;
    // Simulate brief processing then close
    setTimeout(() => {
      this.isWalletProcessing = false;
      this.isWalletModalOpen = false;
      this.showToast('success', `Added ₹${this.walletAmount.toFixed(2)} to wallet`, '', 2000, '');
      this.walletAmount = 0;
    }, 600);
  }

  getPackageList() {
    let data = {
      package_for: 3
    }
    let url = `general/package-details`;
    this.loaderService.show();
    this.commonService.post(url, data).subscribe(
      (response: any) => {
        this.loaderService.hide();
        if (response.code == 200) {
          this.packageList = response.results;
          if (this.packageList && this.packageList.length > 0) {
            this.selectedPackage = this.packageList[0];
          }
        }
      },
      (error) => {
        this.loaderService.hide();
        console.log('error', error);
      }
    );
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
          handler: (blah: any) => {

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
    this.commonService.post(url, {}).subscribe((response: any) => {
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
    this.loaderService.show();
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

    setTimeout(() => {
      this.loaderService.hide();
    }, 2000);   

    modal.onDidDismiss().then((result) => {
      console.log('Payment modal dismissed with result:', result);
      if (result.data.code == 200) {

        // Payment successful
        this.showToast(
          'success',
          result.data.message,
          ``,
          4000,
          ''
        );
        // Refresh profile data to get updated subscription status
        this.getProfileData();

      } else {
        console.error('Payment failed:', result.data.error);
        this.showToast(
          'error',
          'Payment Failed',
          result.data.error || 'Please try again',
          3000,
          ''
        );
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
    this.router.navigate(['/trusted-seller']);
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

  goToTrustedSeller(){
    if(this.profileDetails.pan== null || this.profileDetails.pan== ''){
      this.showToast('warning', 'Please verify your PAN first', '', 3500, '');
      return;
    }

    if(this.profileDetails.pan== null || this.profileDetails.pan== ''){
      this.showToast('warning', 'GST or Udyam is not verified', '', 3500, '');
      return;
    }
    this.router.navigate(['/trusted-seller']);
  }

  async paySelectedPlan() {
    if (!this.selectedPackage) {
      return;
    }
    this.isProcessing = true;
    this.loaderService.show();

    try {
      // Generate order ID from backend API
      const orderId = await this.generateOrderId(this.totalWithGst);
      console.log('✅ Order ID generated:', orderId);

      // Get user details from local storage or service
      const userDetails = {
        name: this.profileDetails.full_name,
        email: this.profileDetails.email,  // ✅ required
        contact: this.profileDetails.phone           // ✅ required
      };
      console.log("selectedPackage", this.selectedPackage);

      // Initialize Razorpay payment directly
      const options = {
        key: 'rzp_live_tAxyS0mxwv0GGX',
        amount: this.totalWithGst * 100, // include GST
        currency: 'INR',
        name: 'Global Rubber Hub',
        description: 'Enhance your trading experience',
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
          this.capturePayment(response);
          this.loaderService.hide();

        },
        modal: {
          ondismiss: () => {
            console.log('⚠️ Payment dismissed by user');
            this.isProcessing = false;
            this.loaderService.hide();
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
        this.loaderService.hide();
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
      this.loaderService.hide();
      console.error('Payment error in modal:', error);
      this.modalController.dismiss({
        success: false,
        error: error.message || error.error || 'Payment failed. Please try again.'
      });
    }
  }

  goToHelpVideo(){
    // Open YouTube video in browser
    const youtubeUrl = 'https://www.youtube.com/watch?v=qBnMoFpAiOk';
    window.open(youtubeUrl, '_blank');
  }

  /**
   * Share app with referral code
   */
  async shareWithFriends() {
    try {
      this.loaderService.show();
      
      // Get user's referral code
      const referralCode = this.profileDetails.referal_code;
      
      if (!referralCode) {
        this.showToast('error', 'No referral code found. Please contact support.', '', 3000, '');
        return;
      }

      // Generate simple referral text
      const shareText = `Join me on Global Rubber Hub!\n\nUse my referral code: ${referralCode}\n\nDownload from Play Store: https://play.google.com/store/apps/details?id=com.globalrubber.hub&referrer=${referralCode}`;

      // Open social share modal
      const modal = await this.modalController.create({
        component: SocialShareModalComponent,
        cssClass: 'social-share-modal',
        componentProps: {
          referralLink: `https://globalrubberhub.com/register?referrer=${referralCode}`,
          playStoreLink: `https://play.google.com/store/apps/details?id=com.globalrubber.hub&referrer=${referralCode}`,
          referralCode: referralCode,
          shareText: shareText
        }
      });

      await modal.present();
      
    } catch (error) {
      console.error('Error opening share modal:', error);
      this.showToast('error', 'Failed to open share options', '', 2000, '');
    } finally {
      this.loaderService.hide();
    }
  }

  /**
   * Copy text to clipboard with fallback
   */
  private async copyToClipboard(text: string): Promise<void> {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
        this.showToast('success', 'Link copied to clipboard!', '', 2000, '');
      } else {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        this.showToast('success', 'Link copied to clipboard!', '', 2000, '');
      }
    } catch (error) {
      console.error('Error copying to clipboard:', error);
      this.showToast('error', 'Failed to copy to clipboard', '', 2000, '');
    }
  }

  capturePayment(razorPay: any) {
    let url = "general/capture-payment";
    let data = {
      recharge_for: 3,
      razorpay_order_id: razorPay.razorpay_order_id,
      razorpay_payment_id: razorPay.razorpay_payment_id,
      razorpay_signature: razorPay.razorpay_signature,
      total_amount: this.selectedPackage.price + this.selectedPackage.price * 18 / 100,
      package_amount: this.selectedPackage.price,
      tax_amount: this.selectedPackage.price * 18 / 100,
      package_id: this.selectedPackage.id
    }
    this.commonService.post(url, data).subscribe(
      (response) => {
        console.log("response", response);
        this.loaderService.hide();
        if (response.code == 200) {
          this.modalController.dismiss();
          this.showToast('success', response.message, '', 2000, '');
          this.getProfileData();
        } else {
          this.showToast('error', response.message, '', 2000, '');
        }
      },
      (error) => {
        this.loaderService.hide();
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

  /**
   * Open Google review functionality
   */
  async openGoogleReview() {
    try {
      console.log('Opening Google review...');
      console.log('Platform check:', {
        isCapacitor: this.platform.is('capacitor'),
        isCordova: this.platform.is('cordova'),
        isMobile: this.platform.is('mobile'),
        isDesktop: this.platform.is('desktop'),
        isAndroid: this.platform.is('android'),
        isIOS: this.platform.is('ios'),
        platforms: this.platform.platforms()
      });

      // Check if we're on a mobile platform
      if (this.platform.is('capacitor') || this.platform.is('cordova') || this.platform.is('mobile')) {
        await this.openMobileGoogleReview();
      } else {
        await this.openWebGoogleReview();
      }
    } catch (error) {
      console.error('Error opening Google review:', error);
      this.showToast('error', 'Failed to open review', 'Please try again later', 3000, '');
    }
  }

  /**
   * Open Google review for mobile platforms
   */
  private async openMobileGoogleReview() {
    try {
      // For Android - try to open Google Play Store
      if (this.platform.is('android')) {
        const playStoreUrl = 'market://details?id=com.globalrubber.hub';
        const playStoreWebUrl = 'https://play.google.com/store/apps/details?id=com.globalrubber.hub';
        
        console.log('Attempting to open Play Store for Android...');
        await this.openUrlWithFallback(playStoreUrl, playStoreWebUrl);
      }
      // For iOS - try to open App Store
      else if (this.platform.is('ios')) {
        const appStoreUrl = 'https://apps.apple.com/app/global-rubber-hub/id1234567890'; // Replace with actual App Store ID
        const appStoreWebUrl = 'https://apps.apple.com/app/global-rubber-hub/id1234567890';
        
        console.log('Attempting to open App Store for iOS...');
        await this.openUrlWithFallback(appStoreUrl, appStoreWebUrl);
      }
      // For other mobile platforms
      else {
        const genericUrl = 'https://play.google.com/store/apps/details?id=com.globalrubber.hub';
        const fallbackUrl = 'https://www.google.com/search?q=Global+Rubber+Hub+review';
        
        console.log('Attempting to open Play Store for other mobile platforms...');
        await this.openUrlWithFallback(genericUrl, fallbackUrl);
      }
    } catch (error) {
      console.error('Error opening mobile Google review:', error);
      // Fallback to web review
      await this.openWebGoogleReview();
    }
  }

  /**
   * Open Google review for web platforms
   */
  private async openWebGoogleReview() {
    try {
      // For web platforms, we can't directly open app stores
      // Instead, show a modal with options or redirect to a review page
      const alert = await this.alertController.create({
        header: 'Rate Global Rubber Hub',
        message: 'We appreciate your feedback! Please choose how you\'d like to rate us:',
        buttons: [
          {
            text: 'Google Play Store',
            handler: () => {
              console.log('Opening Google Play Store...');
              window.open('https://play.google.com/store/apps/details?id=com.globalrubberhub.app', '_blank');
            }
          },
          {
            text: 'App Store',
            handler: () => {
              console.log('Opening App Store...');
              window.open('https://apps.apple.com/app/global-rubber-hub/id1234567890', '_blank');
            }
          },
          {
            text: 'Web Review',
            handler: () => {
              console.log('Opening web review...');
              window.open('https://www.google.com/search?q=Global+Rubber+Hub+review', '_blank');
            }
          },
          {
            text: 'Cancel',
            role: 'cancel'
          }
        ]
      });
      
      await alert.present();
    } catch (error) {
      console.error('Error opening web Google review:', error);
      // Final fallback - just open a generic search
      window.open('https://www.google.com/search?q=Global+Rubber+Hub+review', '_blank');
    }
  }

  /**
   * Alternative method using In-App Review (if available)
   */
  private async openInAppReview() {
    try {
      // Check if In-App Review is available (for Capacitor apps)
      if (this.platform.is('capacitor')) {
        // You can implement In-App Review using a Capacitor plugin
        // For now, we'll use the standard review methods
        await this.openMobileGoogleReview();
      } else {
        await this.openWebGoogleReview();
      }
    } catch (error) {
      console.error('Error with in-app review:', error);
      // Fallback to standard review
      await this.openGoogleReview();
    }
  }

  /**
   * Direct URL opening method with multiple fallbacks
   */
  private async openUrlWithFallback(url: string, fallbackUrl: string) {
    try {
      console.log('Attempting to open URL:', url);
      const newWindow = window.open(url, '_blank');
      
      // Check if window opened successfully
      if (!newWindow || newWindow.closed) {
        console.log('Primary URL failed, trying fallback:', fallbackUrl);
        window.open(fallbackUrl, '_blank');
      }
    } catch (error) {
      console.error('Error opening URL:', error);
      console.log('Trying fallback URL:', fallbackUrl);
      window.open(fallbackUrl, '_blank');
    }
  }

}
