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
        };
      };
    };
  }
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
    // Temporarily disable Google Auth to test if it's causing the black screen
    // await this.initializeGoogleAuth();
    console.log('Login page initialized without Google Auth');
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
        // Initialize Google Auth for native platforms
        await GoogleAuth.initialize({
          clientId: environment.GOOGLE_CLIENT_ID,
          scopes: ['profile', 'email']
        });
        console.log('Google Auth initialized successfully for native platform');
      } else {
        // For web platform, you might need to load the Google API script
        console.log('Google Auth initialized for web platform');
      }
    } catch (error) {
      console.error('Error initializing Google Auth:', error);
    }
  }

  async loginWithGoogle() {
    try {
      this.isGoogleLoading = true;
      
      if (Capacitor.isNativePlatform()) {
        // Native platform (Android/iOS)
        const user = await GoogleAuth.signIn();
        await this.handleGoogleLoginSuccess(user);
      } else {
        // Web platform - using Google Identity Services
        this.initializeGoogleSignInWeb();
      }
    } catch (error) {
      this.isGoogleLoading = false;
      console.error('Google sign-in error:', error);
      this.showToast('error', 'Google sign-in failed', 'Please try again', 3000, '');
    }
  }

  private initializeGoogleSignInWeb() {
    // Load Google Identity Services script
    if (!window.google) {
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = () => {
        this.renderGoogleSignInButton();
      };
      document.head.appendChild(script);
    } else {
      this.renderGoogleSignInButton();
    }
  }

  private renderGoogleSignInButton() {
    if (window.google && window.google.accounts) {
      window.google.accounts.id.initialize({
        client_id: environment.GOOGLE_CLIENT_ID,
        callback: (response: any) => {
          this.handleGoogleWebSignIn(response);
        }
      });

      window.google.accounts.id.renderButton(
        document.getElementById('google-signin-button'),
        { 
          theme: 'outline', 
          size: 'large',
          width: '100%',
          text: 'signin_with'
        }
      );
    }
  }

  private async handleGoogleWebSignIn(response: any) {
    try {
      this.isGoogleLoading = true;
      
      // Decode the JWT token to get user info
      const payload = JSON.parse(atob(response.credential.split('.')[1]));
      
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
      
      await this.handleGoogleLoginSuccess(user);
    } catch (error) {
      this.isGoogleLoading = false;
      console.error('Error handling web Google sign-in:', error);
      this.showToast('error', 'Google sign-in failed', 'Please try again', 3000, '');
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

      this.commonService.googleLogin('google-login', googleData).subscribe(
        (response: any) => {
          this.enableLoader = false;
          
          if (response.code === 200) {
            localStorage.setItem('token', response.access_token);
            
            if (response.user) {
              localStorage.setItem('user', JSON.stringify(response.user));
            }
            
            this.showToast('success', 'Google login successful!', 'Welcome ' + user.displayName, 3000, '/dashboard');
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
