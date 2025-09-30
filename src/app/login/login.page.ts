import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { IonButton, IonContent, IonHeader, IonTitle, IonToolbar, IonModal, IonInput, ModalController, IonSegment, IonSegmentButton, IonLabel, IonItem, IonIcon, IonCheckbox, IonSpinner } from '@ionic/angular/standalone';
import { AlertController, MenuController } from '@ionic/angular';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { CommonService } from '../services/common-service';
import { ToastModalComponent } from '../toast-modal/toast-modal.component';
import { AuthService } from '../services/auth.service';
import { DeepLinkService } from '../services/deep-link.service';
import { ReferralService } from '../services/referral.service';
import { Platform } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { MustMatch } from '../_helper/must-match.validator';
import { NgOtpInputComponent } from 'ng-otp-input';
import { FormsModule as NgFormsModule } from '@angular/forms';
import { environment } from '../../environments/environment';
import { isPlatform } from '@ionic/angular';
import { authConfig } from '../config/auth.config';
import { Subscription } from 'rxjs';
import { GoogleAuth } from '@codetrix-studio/capacitor-google-auth';
import { AuthGuardService } from '../services/auth-guard.service';
import { SocialLogin } from "@capgo/capacitor-social-login";
import { LoaderService } from '../services/loader.service';


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

  // Platform checks
  public isGoogleSignInAvailable: boolean = false;

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
    private referralService: ReferralService
  ) {
    // Initialize Google Auth based on platform
    // this.initializeGoogleAuth();

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

    this.initialize();
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

    // Check for referral code from URL params or stored referral
    await this.checkForReferralCode();

    // Initialize Google Auth on component load
    if (this.platform.is('capacitor')) {
      const clientId = this.platform.is('android')
        ? environment.GOOGLE_ANDROID_CLIENT_ID
        : environment.GOOGLE_WEB_CLIENT_ID;

      await GoogleAuth.initialize({
        clientId: clientId,
        scopes: ['profile', 'email'],
        grantOfflineAccess: true,
      });
      this.isGoogleSignInAvailable = true;
    }
  }





  /**
   * Check for referral code from URL params or stored referral
   */
  async checkForReferralCode() {
    try {
      // Check URL query params for referral code
      const urlParams = new URLSearchParams(window.location.search);
      const referralFromUrl = urlParams.get('referral');
      
      if (referralFromUrl) {
        console.log('Referral code from URL:', referralFromUrl);
        this.registerForm.patchValue({ referralCode: referralFromUrl });
        return;
      }

      // Check for stored referral code
      const storedReferralCode = await this.referralService.getStoredReferralCode();
      if (storedReferralCode) {
        console.log('Stored referral code found:', storedReferralCode);
        this.registerForm.patchValue({ referralCode: storedReferralCode });
      }
    } catch (error) {
      console.error('Error checking for referral code:', error);
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
  login() {
    this.submitted = true;
    if (this.loginForm.invalid) {
      return;
    }

    // Prevent multiple simultaneous login attempts
    if (this.loaderService.isLoading()) {
      return;
    }

    let data = {
      email: this.loginForm.get('email')?.value,
      password: this.loginForm.get('password')?.value,
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
  register() {
    this.submitted = true;
    if (this.registerForm.invalid) {
      return;
    }
    let data = {
      first_name: this.registerForm.get('firstName')?.value,
      last_name: this.registerForm.get('lastName')?.value,
      full_name: `${this.registerForm.get('firstName')?.value}  ${this.registerForm.get('lastName')?.value}`,
      email: this.registerForm.get('email')?.value,
      phone: this.registerForm.get('phone')?.value,
      country_code: "+91",
      password: this.registerForm.get('password')?.value,
      referral_code: this.registerForm.get('referralCode')?.value || null
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

  async initialize() {
    await SocialLogin.initialize({
        google: {
            webClientId: '576336618943-s1deq0icisep54938nvch1nmk4f4ekj2.apps.googleusercontent.com',
            mode: 'online'
        }
    });
}

  // Ensure only digits are entered and limit to 10 for phone input
  onPhoneInput(event: any) {
    const rawValue = event.target && event.target.value ? String(event.target.value) : '';
    const digitsOnly = rawValue.replace(/\D+/g, '').slice(0, 10);
    if (digitsOnly !== rawValue) {
      this.registerForm.patchValue({ phone: digitsOnly });
    }
  }

  /**
   * Handle Google Sign-in
   */
  async signInWithGoogle() {
    const user: any = await SocialLogin.login({
        provider: 'google',
        options: {
            scopes: ['email', 'profile'],
            forceRefreshToken: true
        }
    });
    debugger;;
    console.log('user', user);
    if (user) {
       
    }
}

}
