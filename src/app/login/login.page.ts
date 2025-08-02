import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { IonButton, IonContent, IonHeader, IonTitle, IonToolbar, IonModal, IonInput, ModalController, IonSegment, IonSegmentButton, IonLabel, IonItem, IonIcon, IonCheckbox } from '@ionic/angular/standalone';
import { AlertController, MenuController } from '@ionic/angular';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { CommonService } from '../services/common-service';
import { ToastModalComponent } from '../toast-modal/toast-modal.component';
import { AuthService } from '../services/auth.service';
import { isPlatform } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { MustMatch } from '../_helper/must-match.validator';
import { NgOtpInputComponent } from 'ng-otp-input';
import { FormsModule as NgFormsModule } from '@angular/forms';
import { GoogleAuth } from '@codetrix-studio/capacitor-google-auth';
import { Capacitor } from '@capacitor/core';
import { environment } from '../../environments/environment';

// Google API type declarations
declare global {
  interface Window {
    google: {
      accounts: {
        id: {
          initialize: (config: any) => void;
          renderButton: (element: HTMLElement | null, options: any) => void;
          disableAutoSelect: () => void;
          prompt: (callback?: (notification: any) => void) => void;
          cancel: () => void;
          revoke: (hint: string, callback?: () => void) => void;
        };
      };
    };
  }
}

// Google notification interface
interface GoogleNotification {
  isNotDisplayed(): boolean;
  isSkippedMoment(): boolean;
  getNotDisplayedReason(): string;
  getSkippedReason(): string;
}

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
    NgOtpInputComponent
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class LoginPage implements OnInit {
  @ViewChild('loginInput') loginInput: any;
  
  // Common properties
  public enableLoader: boolean = false;
  public submitted: boolean = false;
  public loginType = 'company';
  public savedLoginCredential: any = [];
  public showCredentialsElem: any = '';
  public savedLoginCounter: number = 0;
  public isOpenCredentialModal: boolean = false;
  public isGoogleLoading: boolean = false;

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

  constructor(
    private formBuilder: FormBuilder,
    public router: Router,
    public modalController: ModalController,
    public activatedRoute: ActivatedRoute,
    private menu: MenuController,
    private commonService: CommonService,
    private authenticationService: AuthService,
    private alertController: AlertController
  ) {
    this.activatedRoute.params.subscribe(async val => {
      let hasLoggin: any = await this.alreadyLoggedIn();
      if (hasLoggin.status === 200) {
        this.router.navigate(['/dashboard'])
      }
    });
  }

  async ngOnInit() {
    this.initializeForms();
    await this.initializeGoogleAuth();
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

  // Tab change handler
  onTabChange(event: any) {
    this.selectedTab = event.detail.value;
    this.resetFormStates();
    
    // Re-render Google button for the new active tab
    if (window.google && window.google.accounts) {
      setTimeout(() => {
        this.renderGoogleButtonOnLoad();
      }, 100);
    }
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
    switch(this.selectedTab) {
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

  async initializeGoogleAuth() {
    try {
      if (Capacitor.isNativePlatform()) {
        // Initialize Google Auth for native platforms (Android/iOS)
        const clientId = isPlatform('android') ? environment.GOOGLE_ANDROID_CLIENT_ID : environment.GOOGLE_WEB_CLIENT_ID;
        console.log('Initializing Google Auth for platform:', Capacitor.getPlatform());
        console.log('Using client ID:', clientId);
        
        await GoogleAuth.initialize({
          clientId: clientId,
          scopes: ['profile', 'email']
        });
        console.log('Google Auth initialized successfully for native platform');
      } else {
        // For web platform, load Google Identity Services
        this.loadGoogleIdentityServices();
      }
    } catch (error) {
      console.error('Error initializing Google Auth:', error);
    }
  }

  private loadGoogleIdentityServices() {
    // Check if Google Identity Services is already loaded
    if (window.google && window.google.accounts) {
      this.initializeGoogleSignInWeb();
      return;
    }

    // Load Google Identity Services script
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => {
      console.log('Google Identity Services loaded');
      this.initializeGoogleSignInWeb();
      // Render the Google button immediately after initialization
      setTimeout(() => {
        this.renderGoogleButtonOnLoad();
      }, 100);
    };
    script.onerror = () => {
      console.error('Failed to load Google Identity Services');
      this.showToast('error', 'Failed to load Google services', 'Please check your internet connection', 3000, '');
    };
    document.head.appendChild(script);
  }

  async loginWithGoogle() {
    try {
      this.isGoogleLoading = true;
      console.log('Google login clicked - Platform:', Capacitor.getPlatform());
      
      if (Capacitor.isNativePlatform()) {
        console.log('Attempting native Google sign-in...');
        // Native platform (Android/iOS)
        const user = await GoogleAuth.signIn();
        console.log('Native Google sign-in successful:', user);
        await this.handleGoogleLoginSuccess(user);
      } else {
        console.log('Attempting web Google sign-in...');
        // Web platform - trigger Google sign-in
        this.triggerGoogleWebSignIn();
      }
    } catch (error: any) {
      this.isGoogleLoading = false;
      console.error('Google sign-in error:', error);
      
      // Better error messages for Android
      let errorMessage = 'Google sign-in failed';
      let errorDetail = 'Please try again';
      
      if (Capacitor.isNativePlatform()) {
        const errorStr = error?.message || error?.toString() || '';
        if (errorStr.includes('12501')) {
          errorMessage = 'Google sign-in cancelled';
          errorDetail = 'Sign-in was cancelled by user';
        } else if (errorStr.includes('12502')) {
          errorMessage = 'Google Play Services error';
          errorDetail = 'Please update Google Play Services';
        } else if (errorStr.includes('10')) {
          errorMessage = 'Configuration error';
          errorDetail = 'Please check your Google Auth setup';
        }
      }
      
      this.showToast('error', errorMessage, errorDetail, 3000, '');
    }
  }

  private initializeGoogleSignInWeb() {
    if (!window.google || !window.google.accounts) {
      console.error('Google Identity Services not available');
      return;
    }

    try {
      // Initialize Google Identity Services
      window.google.accounts.id.initialize({
        client_id: environment.GOOGLE_WEB_CLIENT_ID,
        callback: (response: any) => {
          this.handleGoogleWebSignIn(response);
        },
        auto_select: false,
        cancel_on_tap_outside: true
      });

      console.log('Google Identity Services initialized successfully');
      
      // Render the Google buttons immediately after initialization
      setTimeout(() => {
        this.renderGoogleButtonOnLoad();
      }, 100);
    } catch (error) {
      console.error('Error initializing Google Identity Services:', error);
    }
  }

  private renderGoogleButtonOnLoad() {
    try {
      // Clean up any existing Google buttons first
      this.cleanupExistingGoogleButtons();
      
      // Only render Google button for the currently active tab
      let targetSelector = '';
      
      if (this.selectedTab === 'login' && !this.showForgotPassword && !this.showOtpVerification && !this.showResetPassword) {
        // Login tab is active
        targetSelector = '.google-signin';
      } else if (this.selectedTab === 'register' && !this.showForgotPassword && !this.showOtpVerification && !this.showResetPassword) {
        // Register tab is active
        targetSelector = '.google-signin';
      } else {
        // Other tabs (forgot password, OTP, etc.) - don't render Google button
        return;
      }
      
      // Find the Google sign-in button for the active tab
      const googleButton = document.querySelector(targetSelector) as HTMLElement;
      
      if (googleButton) {
        // Hide the current button
        googleButton.style.display = 'none';
        
        // Create a container for the Google button
        const googleContainer = document.createElement('div');
        googleContainer.id = 'google-signin-container';
        googleContainer.style.width = '100%';
        googleContainer.style.marginTop = '20px';
        
        // Insert the container after the current button
        googleButton.parentNode?.insertBefore(googleContainer, googleButton.nextSibling);
        
        // Render the Google button
        window.google.accounts.id.renderButton(googleContainer, {
          type: 'standard',
          theme: 'outline',
          size: 'large',
          text: 'signin_with',
          shape: 'rectangular',
          logo_alignment: 'left',
          width: '100%'
        });
        
        console.log('Google button rendered for active tab:', this.selectedTab);
      }
    } catch (error) {
      console.error('Error rendering Google button on load:', error);
    }
  }

  private cleanupExistingGoogleButtons() {
    try {
      // Remove existing Google button containers
      const existingContainers = document.querySelectorAll('#google-signin-container');
      existingContainers.forEach(container => {
        container.remove();
      });
      
      // Show all custom Google buttons again
      const customButtons = document.querySelectorAll('.google-signin');
      customButtons.forEach(button => {
        (button as HTMLElement).style.display = 'flex';
      });
    } catch (error) {
      console.error('Error cleaning up existing Google buttons:', error);
    }
  }

  private triggerGoogleWebSignIn() {
    if (!window.google || !window.google.accounts) {
      this.showToast('error', 'Google services not available', 'Please refresh the page and try again', 3000, '');
      this.isGoogleLoading = false;
      return;
    }

    try {
      // The Google button is already rendered, so we can trigger the sign-in
      // Find the Google button and simulate a click
      const googleButton = document.querySelector('[data-testid="google-signin-button"]') as HTMLElement;
      if (googleButton) {
        googleButton.click();
      } else {
        // Fallback: try to find any Google button
        const googleButtons = document.querySelectorAll('[role="button"]');
        const googleSignInButton = Array.from(googleButtons).find(button => 
          button.textContent?.includes('Sign in with Google') || 
          button.getAttribute('aria-label')?.includes('Sign in with Google')
        ) as HTMLElement;
        
        if (googleSignInButton) {
          googleSignInButton.click();
        } else {
          console.log('Google button not found, user needs to click manually');
          this.isGoogleLoading = false;
        }
      }
    } catch (error) {
      console.error('Error triggering Google sign-in:', error);
      this.isGoogleLoading = false;
      this.showToast('error', 'Failed to start Google sign-in', 'Please try again', 3000, '');
    }
  }

  private async handleGoogleWebSignIn(response: any) {
    try {
      console.log('Google web sign-in response received');
      
      if (!response.credential) {
        throw new Error('No credential received from Google');
      }

      // Decode the JWT token to get user info
      const payload = this.decodeJwtToken(response.credential);
      
      const user = {
        id: payload.sub,
        email: payload.email,
        displayName: payload.name,
        givenName: payload.given_name,
        familyName: payload.family_name,
        imageUrl: payload.picture,
        authentication: {
          accessToken: response.credential,
          idToken: response.credential
        }
      };
      
      console.log('Google user data:', user);
      await this.handleGoogleLoginSuccess(user);
    } catch (error) {
      this.isGoogleLoading = false;
      console.error('Error handling web Google sign-in:', error);
      this.showToast('error', 'Google sign-in failed', 'Please try again', 3000, '');
    }
  }

  private decodeJwtToken(token: string): any {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error('Error decoding JWT token:', error);
      throw new Error('Invalid token format');
    }
  }

  async handleGoogleLoginSuccess(user: any) {
    try {
      this.enableLoader = true;
      
      const googleData = {
        google_id: user.id,
        email: user.email,
        name: user.displayName,
        first_name: user.givenName || '',
        last_name: user.familyName || '',
        profile_picture: user.imageUrl || '',
        access_token: user.authentication?.accessToken || '',
        id_token: user.authentication?.idToken || ''
      };

      console.log('Sending Google data to backend:', googleData);

      let url = 'auth/google-login';
      this.commonService.login(url, googleData).subscribe(
        (response: any) => {
          this.enableLoader = false;          
          if (response.code === 200) {            
            localStorage.setItem('token', response.access_token);
            this.showToast('success', response.message, '', 4000, '/dashboard');            
          } else if (response.code === 401) {
            this.showToast('error', response.message || 'Authentication failed', '', 3000, '');
          } else if (response.code === 423) {
            this.showToast('error', response.message || 'Account is locked', '', 3000, '');
          } else {
            this.showToast('error', response.message || 'Login failed', '', 3000, '');
          }
        },
        (error: any) => {
          this.enableLoader = false;
          console.error('Backend error:', error);
          
          let errorMessage = 'Server error. Please try again.';
          if (error.error?.message) {
            errorMessage = error.error.message;
          }
          
          this.showToast('error', errorMessage, '', 3000, '');
        }
      );
    } catch (error) {
      this.enableLoader = false;
      console.error('Error handling Google login success:', error);
      this.showToast('error', 'Error processing login. Please try again.', '', 3000, '');
    }
  }

  async signOutGoogle() {
    try {
      if (Capacitor.isNativePlatform()) {
        await GoogleAuth.signOut();
        console.log('Google user signed out from native platform');
      } else {
        // For web platform, clear any stored tokens
        if (window.google && window.google.accounts) {
          window.google.accounts.id.disableAutoSelect();
        }
        console.log('Google user signed out from web platform');
      }
      
      // Clear any stored user data
      localStorage.removeItem('google_user');
      this.showToast('success', 'Signed out successfully', '', 2000, '');
    } catch (error) {
      console.error('Error signing out from Google:', error);
      this.showToast('error', 'Sign out failed', 'Please try again', 3000, '');
    }
  }

  alreadyLoggedIn() {
    return new Promise((resolve) => {
      this.authenticationService.checkUserIsLoggedin().subscribe(
        (response: any) => {
          resolve(response);
        },
        (error) => {
          console.log('error', error);
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

  setCredential(item:any) {
    this.loginForm.controls['email'].setValue(item.email);
    this.loginForm.controls['password'].setValue(item.password);
    this.closeItemModal();
    this.login();
  }

  closeItemModal() {
    let itmModal:any = document.querySelector('.login-credential-modal');
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
    let data = {
      email: this.loginForm.get('email')?.value,
      password: this.loginForm.get('password')?.value,
    };
    this.enableLoader = true;
    let url = 'auth/login';
    this.commonService.login(url, data).subscribe(
      (response: any) => {
        this.enableLoader = false;
        if (response.code == 200) {
          localStorage.setItem('token', response.access_token);
          this.showToast('success', response.message, '', 4000, '/dashboard');
        } else if (response.code == 401) {
          this.showToast('error', response.message, '', 2000, '');
        } else if (response.code == 423) {
          this.showToast('error', response.message, '', 2000, '');
        }
      },
      (error) => {
        this.enableLoader = false;
        console.log('error ts: ', error.error);
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
      password: this.registerForm.get('password')?.value
    };
    this.enableLoader = true;
    let url = 'auth/registration';
    this.commonService.login(url, data).subscribe(
      (response: any) => {
        this.enableLoader = false;
        if (response.code == 201) {
          localStorage.setItem('token', response.access_token);
          this.showToast('success', response.message, '', 4000, '/dashboard');
        } else if (response.code == 423) {
          this.showToast('error', response.message, '', 2500, '');
        } else {
          this.showToast('error', response.message, '', 2500, '');
        }
      },
      (error) => {
        this.enableLoader = false;
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

    this.enableLoader = true;
    let url = 'auth/forgot-password';
    this.commonService.login(url, data).subscribe(
      (response: any) => {
        this.enableLoader = false;
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
        this.enableLoader = false;
        console.log('error ts: ', error.error);
      }
    );
  }

  // OTP functionality
  onOtpChange(ev: any) {
    this.otpForm.patchValue({emailOTP: ev});
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
    this.enableLoader = true;
    let url = 'auth/verify-otp';
    this.commonService.login(url, data).subscribe(
      (response: any) => {
        this.enableLoader = false;
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
        this.enableLoader = false;
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
    this.enableLoader = true;
    let url = 'auth/reset-password';
    this.commonService.login(url, data).subscribe(
      (response: any) => {
        this.enableLoader = false;
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
        this.enableLoader = false;
        console.log('error ts: ', error.error);
      }
    );
  }

  async deleteCredential(item:any) {
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

  async saveLoginCredential(name:any) {
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
}
