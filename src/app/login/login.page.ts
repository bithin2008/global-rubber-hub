import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { IonButton, IonContent, IonHeader, IonTitle, IonToolbar, IonModal, IonInput, ModalController, IonSegment, IonSegmentButton, IonLabel, IonItem, IonIcon, IonCheckbox, IonSpinner } from '@ionic/angular/standalone';
import { AlertController, MenuController } from '@ionic/angular';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { CommonService } from '../services/common-service';
import { ToastModalComponent } from '../toast-modal/toast-modal.component';
import { AuthService } from '../services/auth.service';
import { DeepLinkService } from '../services/deep-link.service';
import { Platform } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { MustMatch } from '../_helper/must-match.validator';
import { NgOtpInputComponent } from 'ng-otp-input';
import { FormsModule as NgFormsModule } from '@angular/forms';
import { environment } from '../../environments/environment';
import { GoogleAuth } from '@codetrix-studio/capacitor-google-auth';
import { isPlatform } from '@ionic/angular';
import { authConfig } from '../config/auth.config';




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
export class LoginPage implements OnInit {
  @ViewChild('loginInput') loginInput: any;
  user: any;
  
  // Common properties
  public enableLoader: boolean = false;
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
  constructor(
    private formBuilder: FormBuilder,
    public router: Router,
    public authService: AuthService,
    public modalController: ModalController,
    public activatedRoute: ActivatedRoute,
    private menu: MenuController,
    private commonService: CommonService,
    private authenticationService: AuthService,
    private alertController: AlertController,
    private platform: Platform,
    private deepLinkService: DeepLinkService
  ) {
    // Initialize Google Auth based on platform
    this.initializeGoogleAuth();
    
    this.activatedRoute.params.subscribe(async val => {
      let hasLoggin: any = await this.alreadyLoggedIn();
      if (hasLoggin.code === 200) {
        this.router.navigate(['/dashboard'])
      } else {
        localStorage.clear();
        this.router.navigate(['/login']);
      }
    });
  }

  private async initializeGoogleAuth() {
    try {
      // Get client ID from auth config
      const clientId = authConfig.googleAuth.androidClientId;
      
      // Base configuration
      const config = {
        clientId,
        scopes: ['profile', 'email'],
        grantOfflineAccess: true,
      };

      // Platform specific configuration
      if (isPlatform('android')) {
        // Android specific config
        Object.assign(config, { androidClientId: clientId });
      } else if (isPlatform('ios')) {
        // iOS specific config - add iOS client ID when available
        // Object.assign(config, { iosClientId: authConfig.googleAuth.iosClientId });
      } else {
        // Web specific config
        Object.assign(config, { 
          webClientId: clientId,
          plugin: false // Disable native plugin for web
        });
      }

      await GoogleAuth.initialize(config);
    } catch (error) {
      console.error('Error initializing Google Auth:', error);
    }
  }

  async ngOnInit() {
    this.token = localStorage.getItem('token');
    if (this.token) {
      this.getProfileData();
    }
    this.initializeForms();
  }

  async signInWithGoogle() {
    try {
      this.enableLoader = true;
      
      // Check network connectivity
      if (!navigator.onLine) {
        throw new Error('No internet connection. Please check your network and try again.');
      }

      // Initialize Google Auth if needed
      try {
        await GoogleAuth.initialize({
          clientId: authConfig.googleAuth.androidClientId,
          scopes: ['profile', 'email'],
          grantOfflineAccess: true
        });
      } catch (initError) {
        console.error('Failed to initialize Google Auth:', initError);
        throw new Error('Failed to initialize Google Sign-In. Please try again.');
      }

      // Get user info from Google
      const user = await GoogleAuth.signIn();
      console.log('Google login successful:', user);
      
      if (!user || !user.email) {
        throw new Error('Failed to get user information from Google');
      }

      // Send to backend for authentication/registration
      const data = {
        email: user.email,
        google_id: user.id,
        first_name: user.givenName || '',
        last_name: user.familyName || '',
        full_name: user.name || `${user.givenName} ${user.familyName}`.trim(),
        photo_url: user.imageUrl || ''
      };

      let url = 'auth/google-login';
      const response = await this.commonService.login(url, data).toPromise() as any;
      
      if (response?.code === 200) {
        localStorage.setItem('token', response.access_token);
        this.authenticationService.handleSuccessfulLogin();
        await this.showToast('success', response.message || 'Login successful', '', 2000, '/dashboard');
      } else {
        const errorMsg = response?.message || 'Authentication failed';
        throw new Error(errorMsg);
      }
    } catch (error: any) {
      console.error('Google sign in error:', error);
      
      let errorMessage = 'Google sign in failed';
      
      if (error.message) {
        errorMessage = error.message;
      } else if (error.name === 'NetworkError' || !navigator.onLine) {
        errorMessage = 'Network error. Please check your connection and try again.';
      } else if (error.code === 'CANCELED') {
        errorMessage = 'Sign in was cancelled';
      } else if (error.code === 'INVALID_CLIENT_ID') {
        errorMessage = 'Invalid client configuration. Please contact support.';
      }
      
      await this.showToast('error', errorMessage, '', 3000, '');
    } finally {
      this.enableLoader = false;
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
    this.enableLoader = true;
    let url = 'user/profile';
    this.commonService.get(url).subscribe(
      (response: any) => {
        this.enableLoader = false;
        if (response.code == 200) {
          this.profileDetails = response.user;
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
      
      const jsonPayload = decodeURIComponent(decoded.split('').map(function(c) {
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
          this.authenticationService.handleSuccessfulLogin();
          this.showToast('success', response.message, '', 2000, '/dashboard');
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
          this.authenticationService.handleSuccessfulLogin();
          this.showToast('success', response.message, '', 2000, '/dashboard');
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

  /**
   * Handle Google Sign-in
   */
 
}
