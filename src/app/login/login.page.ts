import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { IonButton, IonContent, IonHeader, IonTitle, IonToolbar, IonModal, IonInput, ModalController, IonSegment, IonSegmentButton, IonLabel, IonItem, IonIcon, IonCheckbox, IonSpinner } from '@ionic/angular/standalone';
import { AlertController, MenuController } from '@ionic/angular';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { CommonService } from '../services/common-service';
import { ToastModalComponent } from '../toast-modal/toast-modal.component';
import { AuthService } from '../services/auth.service';
import { DeepLinkService } from '../services/deep-link.service';
import { SimpleReferrerService } from '../services/simple-referrer.service';
import { Platform } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { MustMatch } from '../_helper/must-match.validator';
import { NgOtpInputComponent } from 'ng-otp-input';
import { FormsModule as NgFormsModule } from '@angular/forms';
import { environment } from '../../environments/environment';
import { isPlatform } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { AuthGuardService } from '../services/auth-guard.service';
import { LoaderService } from '../services/loader.service';
import { FirebaseService } from '../services/firebase.service';
import { Device } from '@ionic-native/device/ngx';


0

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    NgFormsModule,
    IonInput,
    IonButton,
    IonContent,
    IonSegment,
    IonSegmentButton,
    IonLabel,
    IonItem,
    IonIcon,
    IonSpinner,
    NgOtpInputComponent
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class LoginPage implements OnInit, OnDestroy {
  @ViewChild('loginInput') loginInput: any;
  user: any;

  // Common properties
  public submitted: boolean = false;
  public loginType = 'company';
  public savedLoginCredential: any = [];
  public showCredentialsElem: any = '';
  public savedLoginCounter: number = 0;
  public isOpenCredentialModal: boolean = false;

  // Tab and form state management
  public selectedTab: string = 'login';
  public showForgotPassword: boolean = false;
  public showOtpVerification: boolean = false;
  public showResetPassword: boolean = false;

  // Password visibility states
  public showLoginPassword: boolean = false;
  public showRegisterPassword: boolean = false;
  
  // Referral code state
  public isReferralCodeFromUrl: boolean = false;
  public showConfirmPassword: boolean = false;
  public showResetPasswordField: boolean = false;
  public showResetConfirmPassword: boolean = false;

  // Forms
  public loginForm!: FormGroup;
  public registerForm!: FormGroup;
  public forgotPasswordForm!: FormGroup;
  public otpForm!: FormGroup;
  public resetPasswordForm!: FormGroup;
  public profileDetails: any = {};
  token: any;

  // Subscription management
  private routeSubscription: Subscription | undefined;

  // Device information properties
  public deviceModel: string = '';
  public devicePlatform: string = '';
  public deviceOSVersion: string = '';
  public deviceInfo: any = {};


  constructor(
    public router: Router,
    private formBuilder: FormBuilder,
    public authService: AuthService,
    public modalController: ModalController,
    public activatedRoute: ActivatedRoute,
    private menu: MenuController,
    private commonService: CommonService,
    private authenticationService: AuthService,
    private alertController: AlertController,
    private platform: Platform,
    private deepLinkService: DeepLinkService,
    private authGuardService: AuthGuardService,
    private loaderService: LoaderService,
    private simpleReferrerService: SimpleReferrerService,
    private firebaseService: FirebaseService,
    private device: Device
  ) {

    // Subscribe to route params with proper unsubscribe handling
    this.routeSubscription = this.activatedRoute.params.subscribe(async val => {
    
      // Only check login status if we're not already processing
      if (!this.loaderService.isLoading()) {
        // Fast local check to avoid unnecessary API call
        const hasToken = this.authGuardService.hasToken();
        let hasLoggin: any = { code: hasToken ? 200 : 401 };

        // If token exists, optionally verify with backend as before
        if (hasToken) {
          hasLoggin = await this.alreadyLoggedIn();
        }

        if (hasLoggin.code === 200) {
          // Only navigate if we're not already on dashboard
          if (this.router.url !== '/dashboard') {
            this.router.navigate(['/dashboard']);
          }
        } else {
          // Only clear localStorage and navigate if we're not already on login page
          if (this.router.url !== '/login') {
            localStorage.clear();
            this.router.navigate(['/login']);
          }
        }
      }
    });

  }

  ngOnDestroy() {
    // Unsubscribe to prevent memory leaks
    if (this.routeSubscription) {
      this.routeSubscription.unsubscribe();
    }
  }

  async ngOnInit() {
    this.token = localStorage.getItem('token');
    if (this.token) {
      this.getProfileData();
    }
    this.initializeForms();

    // Get device information
  //  this.getDeviceInformation();
    
    // Check FCM token status
   // this.checkFCMTokenStatus();
    
    // Test FCM token generation (for debugging)
    setTimeout(() => {
    //  this.testFCMTokenGeneration();
    }, 2000); // Wait 2 seconds after component initialization

    // Initialize referrer service and check for referrer
    setTimeout(async () => {
      await this.simpleReferrerService.initializeReferrer();
      this.checkAndStoreReferrer();
      this.checkStoredReferrer();
    }, 300);

    // Testing code removed - referral codes will be handled naturally

    // Testing methods removed - referral codes will be handled naturally
  }





  /**
   * Setup listener for referrer changes
   */
  setupReferralCodeListener() {
    // Listen for app state changes to check for new referrer
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) {
        // App became visible, check for new referrer
        this.checkAndStoreReferrer();
      }
    });

    // Also listen for focus events
    window.addEventListener('focus', () => {
      this.checkAndStoreReferrer();
    });
  }

  /**
   * Check for referrer and store it in localStorage
   */
  checkAndStoreReferrer() {
    try {
      console.log('🔍 Checking for referrer...');
      const referrer = this.simpleReferrerService.checkAndStoreReferrer();
      
      if (referrer) {
        console.log('✅ Referrer found and stored:', referrer);
        // Pre-fill the referral code field
        this.registerForm.patchValue({ referralCode: referrer });
        this.registerForm.get('referralCode')?.disable();
        this.isReferralCodeFromUrl = true;
        
        // Show success message to user
        console.log('✅ Referral code applied from URL:', referrer);
      } else {
        console.log('❌ No referrer found');
        this.isReferralCodeFromUrl = false;
      }
    } catch (error) {
      console.error('Error checking for referrer:', error);
      this.isReferralCodeFromUrl = false;
    }
  }

  /**
   * Check for stored referrer and apply to form
   */
  checkStoredReferrer() {
    try {
      console.log('🔍 Checking for stored referrer...');
      const storedReferrer = this.simpleReferrerService.getStoredReferrer();
      
      if (storedReferrer) {
        console.log('✅ Stored referrer found:', storedReferrer);
        // Pre-fill the referral code field
        this.registerForm.patchValue({ referralCode: storedReferrer });
        this.registerForm.get('referralCode')?.disable();
        this.isReferralCodeFromUrl = true;
        
        // Show success message to user
        console.log('✅ Referral code applied from stored value:', storedReferrer);
      } else {
        console.log('❌ No stored referrer found');
        this.isReferralCodeFromUrl = false;
      }
    } catch (error) {
      console.error('Error checking stored referrer:', error);
      this.isReferralCodeFromUrl = false;
    }
  }

  /**
   * Manually refresh referrer check
   */
  refreshReferralCode() {
    console.log('Manually refreshing referrer check...');
    this.checkAndStoreReferrer();
  }

  /**
   * Set referrer code for testing (simulates Play Store referrer parameter)
   */
  setReferrerCodeForTesting(referrerCode: string) {
    console.log('Setting referrer code for testing:', referrerCode);
    this.simpleReferrerService.storeReferrer(referrerCode);
    this.checkAndStoreReferrer();
  }

  // Debug methods removed - referral codes will be handled naturally

  /**
   * Show referral error message
   */
  private async showReferralError(message: string): Promise<void> {
    try {
      // You can implement a toast or alert here
      console.error('Referral Error:', message);
      // For now, just log to console - you can add toast/alert here
    } catch (error) {
      console.error('Error showing referral error:', error);
    }
  }

  initializeForms() {
    // Login Form
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.pattern(/^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i)]],
      password: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(30), Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*\W).*$/)]]
    });

    // Register Form
    this.registerForm = this.formBuilder.group({
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      phone: ['', [Validators.required, Validators.pattern(/^[6-9]\d{9}$/)]],
      email: ['', [Validators.required, Validators.pattern(/^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i)]],
      password: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(30), Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*\W).*$/)]],
      confirmPassword: ['', Validators.required],
      referralCode: [''] // Optional referral code field
    }, {
      validator: MustMatch('password', 'confirmPassword')
    });

    // Forgot Password Form
    this.forgotPasswordForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.pattern(/^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i)]]
    });

    // OTP Form
    this.otpForm = this.formBuilder.group({
      emailOTP: ['', [Validators.required]]
    });

    // Reset Password Form
    this.resetPasswordForm = this.formBuilder.group({
      password: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(30), Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*\W).*$/)]],
      confirmPassword: ['', Validators.required],
    }, {
      validator: MustMatch('password', 'confirmPassword')
    });
  }

  /**
   * Get device information including model, platform, and OS version
   */
  getDeviceInformation() {
    try {
      // Check if device plugin is available and we're on a native platform
      if (this.device && this.device.model && (this.platform.is('capacitor') || this.platform.is('cordova'))) {
        this.deviceModel = this.device.model || 'Unknown';
        this.devicePlatform = this.device.platform || 'Unknown';
        this.deviceOSVersion = this.device.version || 'Unknown';
        
        // Store complete device info
        this.deviceInfo = {
          model: this.deviceModel,
          platform: this.devicePlatform,
          version: this.deviceOSVersion,
          manufacturer: this.device.manufacturer || 'Unknown',
          serial: this.device.serial || 'Unknown',
          uuid: this.device.uuid || 'Unknown',
          isVirtual: this.device.isVirtual || false,
          cordova: this.device.cordova || 'Unknown'
        };

        console.log('Device Information:', this.deviceInfo);
        
        // Log device information for debugging
        console.log('Device Model:', this.deviceModel);
        console.log('Device Platform:', this.devicePlatform);
        console.log('Device OS Version:', this.deviceOSVersion);
        
        // Display device information in a user-friendly way
        this.displayDeviceInfo();
        
        // Also display FCM token for debugging
        this.displayFCMToken();
      } else {
        console.warn('Device plugin not available or not ready');
        this.deviceModel = 'Web Browser';
        this.devicePlatform = this.platform.platforms().join(', ') || 'Web';
        this.deviceOSVersion = navigator.userAgent || 'Unknown';
        
        this.deviceInfo = {
          model: this.deviceModel,
          platform: this.devicePlatform,
          version: this.deviceOSVersion,
          userAgent: navigator.userAgent,
          isWeb: true
        };
        
        // Display device information for web browser
        this.displayDeviceInfo();
        
        // Also display FCM token for debugging
        this.displayFCMToken();
      }
    } catch (error) {
      console.error('Error getting device information:', error);
      this.deviceModel = 'Unknown';
      this.devicePlatform = 'Unknown';
      this.deviceOSVersion = 'Unknown';
    }
  }

  /**
   * Display device information in a user-friendly format
   */
  displayDeviceInfo() {
    console.log('=== DEVICE INFORMATION ===');
    console.log(`Model: ${this.deviceModel}`);
    console.log(`Platform: ${this.devicePlatform}`);
    console.log(`OS Version: ${this.deviceOSVersion}`);
    console.log('==========================');
  }

  /**
   * Display FCM token for debugging
   */
  displayFCMToken() {
    const fcmToken = this.firebaseService.getFCMToken();
    console.log('=== FCM TOKEN ===');
    if (fcmToken) {
      console.log(`FCM Token: ${fcmToken}`);
    } else {
      console.log('FCM Token: Not available yet');
    }
    console.log('==================');
  }

  /**
   * Get FCM token for authentication requests
   */
  async getFCMTokenForAuth(): Promise<string> {
    let fcmToken = this.firebaseService.getFCMToken();
    
    if (fcmToken) {
      console.log('Using existing FCM token for authentication:', fcmToken);
      return fcmToken;
    } else {
      console.warn('FCM token not available, attempting to generate...');
      
      // Try to force generate FCM token with service worker
      fcmToken = await this.firebaseService.forceGenerateFCMToken();
      
      if (fcmToken) {
        console.log('FCM token generated successfully with service worker:', fcmToken);
        return fcmToken;
      } else {
        console.warn('Failed to generate FCM token with service worker, trying without...');
        
        // Try fallback method without service worker
        fcmToken = await this.firebaseService.generateFCMTokenWithoutSW();
        
        if (fcmToken) {
          console.log('FCM token generated successfully without service worker:', fcmToken);
          return fcmToken;
        } else {
          console.warn('Failed to generate FCM token with both methods, using empty string');
          return '';
        }
      }
    }
  }

  /**
   * Trigger FCM token generation
   */
  private async triggerFCMTokenGeneration() {
    console.log('Attempting to trigger FCM token generation...');
    try {
      const token = await this.firebaseService.generateFCMToken();
      if (token) {
        console.log('FCM token generated successfully:', token);
      } else {
        console.warn('Failed to generate FCM token');
      }
    } catch (error) {
      console.error('Error generating FCM token:', error);
    }
  }

  /**
   * Check FCM token status
   */
  private checkFCMTokenStatus() {
    const fcmToken = this.firebaseService.getFCMToken();
    console.log('=== FCM TOKEN STATUS ===');
    if (fcmToken) {
      console.log('FCM Token is available:', fcmToken);
    } else {
      console.log('FCM Token is not available yet');
      console.log('This is normal for the first load. Token will be generated when needed.');
    }
    console.log('========================');
  }

  /**
   * Test FCM token generation (for debugging)
   */
  async testFCMTokenGeneration() {
    console.log('=== TESTING FCM TOKEN GENERATION ===');
    try {
      // Try with service worker first
      let token = await this.firebaseService.forceGenerateFCMToken();
      if (token) {
        console.log('✅ FCM token generated successfully with service worker:', token);
        return token;
      } else {
        console.log('❌ Failed to generate FCM token with service worker, trying without...');
        
        // Try without service worker
        token = await this.firebaseService.generateFCMTokenWithoutSW();
        if (token) {
          console.log('✅ FCM token generated successfully without service worker:', token);
          return token;
        } else {
          console.log('❌ Failed to generate FCM token with both methods');
          return null;
        }
      }
    } catch (error) {
      console.error('❌ Error testing FCM token generation:', error);
      return null;
    }
  }

  getProfileData() {
    this.loaderService.show();
    let url = 'user/profile';
    this.commonService.get(url).subscribe(
      (response: any) => {
        this.loaderService.hide();
        if (response.code == 200) {
          this.profileDetails = response.user;
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




  // Tab change handler
  onTabChange(event: any) {
    this.selectedTab = event.detail.value;
    this.resetFormStates();


  }

  // Navigation methods
  showForgotPasswordForm() {
    this.showForgotPassword = true;
    this.showOtpVerification = false;
    this.showResetPassword = false;
    this.selectedTab = 'forgot-password';
    this.resetFormStates();
  }

  backToLogin() {
    this.showForgotPassword = false;
    this.showOtpVerification = false;
    this.showResetPassword = false;
    this.selectedTab = 'login';
    this.resetFormStates();
  }

  backToForgotPassword() {
    this.showForgotPassword = true;
    this.showOtpVerification = false;
    this.showResetPassword = false;
    this.selectedTab = 'forgot-password';
    this.resetFormStates();
  }

  resetFormStates() {
    this.submitted = false;
    this.loginForm.reset();
    this.registerForm.reset();
    this.forgotPasswordForm.reset();
    this.otpForm.reset();
    this.resetPasswordForm.reset();

    // Reset password visibility states
    this.showLoginPassword = false;
    this.showRegisterPassword = false;
    this.showConfirmPassword = false;
    this.showResetPasswordField = false;
    this.showResetConfirmPassword = false;
  }

  // Password toggle functions
  toggleLoginPassword() {
    this.showLoginPassword = !this.showLoginPassword;
  }

  toggleRegisterPassword() {
    this.showRegisterPassword = !this.showRegisterPassword;
  }

  toggleConfirmPassword() {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  toggleResetPassword() {
    this.showResetPasswordField = !this.showResetPasswordField;
  }

  toggleResetConfirmPassword() {
    this.showResetConfirmPassword = !this.showResetConfirmPassword;
  }

  // Form getters
  get f() {
    switch (this.selectedTab) {
      case 'login':
        return this.loginForm.controls;
      case 'register':
        return this.registerForm.controls;
      case 'forgot-password':
        return this.forgotPasswordForm.controls;
      case 'otp-verification':
        return this.otpForm.controls;
      case 'reset-password':
        return this.resetPasswordForm.controls;
      default:
        return this.loginForm.controls;
    }
  }


  private decodeJwtToken(token: string): any {
    try {
      const base64Url = token.split('.')[1];
      if (!base64Url) {
        throw new Error('Invalid token format: missing payload');
      }

      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const decoded = atob(base64);

      if (!decoded) {
        throw new Error('Invalid token format: failed to decode base64');
      }

      const jsonPayload = decodeURIComponent(decoded.split('').map(function (c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));

      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error('Error decoding JWT token:', error);
      throw new Error('Invalid token format');
    }
  }

  alreadyLoggedIn() {
    return new Promise((resolve) => {
      this.authenticationService.checkUserIsLoggedin().subscribe(
        (response: any) => {
          resolve(response);
        },
        (error) => {
          console.log('Login check error:', error);
          // Return error response instead of leaving promise hanging
          resolve({ code: 401, message: 'Authentication check failed' });
        }
      );
    });
  }

  changeLoginType() {
    this.loginForm.reset();
    this.submitted = false;
  }

  checkSavedLogin() {
    if (this.savedLoginCounter == 0) {
      this.savedLoginCounter++;
    } else {
      setTimeout(() => {
        this.savedLoginCounter = 0;
      }, 45 * 1000);
    }
  }

  setCredential(item: any) {
    this.loginForm.controls['email'].setValue(item.email);
    this.loginForm.controls['password'].setValue(item.password);
    this.closeItemModal();
    this.login();
  }

  closeItemModal() {
    let itmModal: any = document.querySelector('.login-credential-modal');
    itmModal.classList.remove('openMenu');
    itmModal.classList.add('closeMenu');
    this.isOpenCredentialModal = false;
    itmModal.addEventListener('animationend', (e: any) => {
      if (e.target == itmModal) {
        itmModal.classList.remove('closeMenu');
      };
    });
  }

  // Login functionality
  async login() {
    this.submitted = true;
    if (this.loginForm.invalid) {
      return;
    }

    // Prevent multiple simultaneous login attempts
    if (this.loaderService.isLoading()) {
      return;
    }

    // Get FCM token
    const fcmToken = await this.getFCMTokenForAuth();

    let data = {
      email: this.loginForm.get('email')?.value,
      password: this.loginForm.get('password')?.value,
      // fcm_token: fcmToken, // Get actual FCM token from Firebase service
      // device_model: this.deviceModel,
      // platform: this.devicePlatform,
      // os_version: this.deviceOSVersion
    };
    this.loaderService.show();
    let url = 'auth/login';
    this.commonService.login(url, data).subscribe(
      (response: any) => {
        this.loaderService.hide();
        if (response.code == 200) {
          localStorage.setItem('token', response.access_token);
          this.authenticationService.handleSuccessfulLogin();
          this.showToast('success', response.message, '', 2000, '/dashboard');
        } else if (response.code == 401) {
          this.showToast('error', response.message, '', 2000, '');
        } else if (response.code == 423) {
          this.showToast('error', response.message, '', 2000, '');
        }
      },
      (error) => {
        this.loaderService.hide();
        console.log('Login error:', error.error);
      }
    );
  }

  // Register functionality
  async register() {
    this.submitted = true;
    if (this.registerForm.invalid) {
      return;
    }
    
    // Get FCM token
    const fcmToken = await this.getFCMTokenForAuth();
    
    let data = {
      first_name: this.registerForm.get('firstName')?.value,
      last_name: this.registerForm.get('lastName')?.value,
      full_name: `${this.registerForm.get('firstName')?.value}  ${this.registerForm.get('lastName')?.value}`,
      email: this.registerForm.get('email')?.value,
      phone: this.registerForm.get('phone')?.value,
      country_code: "+91",
      password: this.registerForm.get('password')?.value,
      ref_code: this.registerForm.get('referralCode')?.value || null,
      fcm_token: fcmToken, // Get actual FCM token from Firebase service
      device_model: this.deviceModel,
      platform: this.devicePlatform,
      os_version: this.deviceOSVersion
    };
    this.loaderService.show();
    let url = 'auth/registration';
    this.commonService.login(url, data).subscribe(
      (response: any) => {
        this.loaderService.hide();
        if (response.code == 201) {
          localStorage.setItem('token', response.access_token);
          this.authenticationService.handleSuccessfulLogin();
          this.showToast('success', response.message, '', 2000, '/dashboard');
        } else if (response.code == 423) {
          this.showToast('error', response.message, '', 2500, '');
        } else {
          this.showToast('error', response.message, '', 2500, '');
        }
      },
      (error) => {
        this.loaderService.hide();
        console.log('error ts: ', error.error);
      }
    );
  }

  // Forgot Password functionality
  forgotPassword() {
    this.submitted = true;
    if (this.forgotPasswordForm.invalid) {
      return;
    }
    let data = {
      email: this.forgotPasswordForm.get('email')?.value
    };

    this.loaderService.show();
    let url = 'auth/forgot-password';
    this.commonService.login(url, data).subscribe(
      (response: any) => {
        this.loaderService.hide();
        if (response.code == 200) {
          localStorage.setItem('email', this.forgotPasswordForm.get('email')?.value);
          this.showOtpVerification = true;
          this.showForgotPassword = false;
          this.showResetPassword = false;
          this.selectedTab = 'otp-verification';
          this.showToast('success', response.message, '', 2000, '');
        } else if (response.code == 401) {
          this.showToast('error', response.message, '', 2000, '');
        } else if (response.code == 423) {
          this.showToast('error', response.message, '', 2000, '');
        } else {
          this.showToast('error', response.message, '', 2000, '');
        }
      },
      (error) => {
        this.loaderService.hide();
        console.log('error ts: ', error.error);
      }
    );
  }

  // OTP functionality
  onOtpChange(ev: any) {
    this.otpForm.patchValue({ emailOTP: ev });
  }

  verifyOtp() {
    this.submitted = true;
    if (this.otpForm.invalid) {
      return;
    }
    let data = {
      email: localStorage.getItem('email'),
      otp: this.otpForm.get('emailOTP')?.value,
    };
    this.loaderService.show();
    let url = 'auth/verify-otp';
    this.commonService.login(url, data).subscribe(
      (response: any) => {
        this.loaderService.hide();
        if (response.code == 200) {
          this.showResetPassword = true;
          this.showForgotPassword = false;
          this.showOtpVerification = false;
          this.selectedTab = 'reset-password';
          this.showToast('success', response.message, '', 2000, '');
        } else if (response.code == 401) {
          this.showToast('error', response.message, '', 2000, '');
        } else if (response.code == 423) {
          this.showToast('error', response.message, '', 2000, '');
        } else {
          this.showToast('error', response.message, '', 2000, '');
        }
      },
      (error) => {
        this.loaderService.hide();
        console.log('error ts: ', error.error);
      }
    );
  }

  // Reset Password functionality
  resetPassword() {
    this.submitted = true;
    if (this.resetPasswordForm.invalid) {
      return;
    }
    let data = {
      email: localStorage.getItem('email'),
      new_password: this.resetPasswordForm.get('password')?.value,
      new_password_confirmation: this.resetPasswordForm.get('confirmPassword')?.value,
    };
    this.loaderService.show();
    let url = 'auth/reset-password';
    this.commonService.login(url, data).subscribe(
      (response: any) => {
        this.loaderService.hide();
        if (response.code == 200) {
          this.showToast('success', response.message, '', 2000, '/login');
          this.backToLogin();
        } else if (response.code == 401) {
          this.showToast('error', response.message, '', 2000, '');
        } else if (response.code == 423) {
          this.showToast('error', response.message, '', 2000, '');
        } else {
          this.showToast('error', response.message, '', 2000, '');
        }
      },
      (error) => {
        this.loaderService.hide();
        console.log('error ts: ', error.error);
      }
    );
  }

  async deleteCredential(item: any) {
    const alert = await this.alertController.create({
      header: 'Warning',
      message: 'Want to delete password?',
      buttons: [
        {
          text: 'No',
          role: 'cancel',
          cssClass: 'alert-cancel',
          handler: (blah) => {

          }
        }, {
          text: 'Yes',
          cssClass: 'alert-ok',
          handler: () => {
            // Implementation for deleting credentials
          }
        }
      ]
    });
    await alert.present();
  }

  async saveLoginCredential(name: any) {
    const alert = await this.alertController.create({
      header: 'Hi,' + name,
      message: 'Want to save  password?',
      buttons: [
        {
          text: 'No',
          role: 'cancel',
          cssClass: 'alert-cancel',
          handler: (blah) => {

          }
        }, {
          text: 'Yes',
          cssClass: 'alert-ok',
          handler: () => {
            // Implementation for saving credentials
          }
        }
      ]
    });
    await alert.present();
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


  // Ensure only digits are entered and limit to 10 for phone input
  onPhoneInput(event: any) {
    const rawValue = event.target && event.target.value ? String(event.target.value) : '';
    const digitsOnly = rawValue.replace(/\D+/g, '').slice(0, 10);
    if (digitsOnly !== rawValue) {
      this.registerForm.patchValue({ phone: digitsOnly });
    }
  }

  // Google Sign-In method
  async signInWithGoogle() {
    try {
      this.loaderService.show();
      const response = await this.firebaseService.signInWithGoogle();
      this.loaderService.hide();
      
      if (response.code === 200 || response.code === 201) {
        this.showToast('success', 'Successfully signed in with Google!', '', 2000, '/dashboard');
      } else {
        this.showToast('error', response.message || 'Google Sign-In failed', '', 2000, '');
      }
    } catch (error) {
      this.loaderService.hide();
      console.error('Google Sign-In Error:', error);
      this.showToast('error', 'Google Sign-In failed. Please try again.', '', 2000, '');
    }
  }

}
