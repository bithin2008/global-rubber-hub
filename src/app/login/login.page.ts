import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { IonButton, IonContent, IonHeader, IonTitle, IonToolbar, IonModal, IonInput, ModalController } from '@ionic/angular/standalone';
import { AlertController, MenuController } from '@ionic/angular';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { CommonService } from '../services/common-service';
import { ToastModalComponent } from '../toast-modal/toast-modal.component';
import { AuthService } from '../services/auth.service';
import { isPlatform } from '@ionic/angular';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [ CommonModule, RouterModule, FormsModule, ReactiveFormsModule, IonInput, IonButton, IonContent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class LoginPage implements OnInit {
  @ViewChild('loginInput') loginInput: any;
  public enableLoader: boolean = false;
  public loginForm!: FormGroup;
  public submitted: boolean = false;
  public loginType = 'company';
  public savedLoginCredential: any = [];
  public showCredentialsElem: any = '';
  public savedLoginCounter: number = 0;
  public isOpenCredentialModal: boolean = false;
  public isGoogleLoading: boolean = false;

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
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.pattern(/^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i)]],
      password: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(30), Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*\W).*$/)]]
    });

    // Initialize Google Auth
    await this.initializeGoogleAuth();
  }

  async initializeGoogleAuth() {
    try {
      // Initialize Google Auth plugin
     
      console.log('Google Auth initialized successfully');
    } catch (error) {
      console.error('Error initializing Google Auth:', error);
    }
  }

  async loginWithGoogle() {
    
  }

  async handleGoogleLoginSuccess(user: any) {
    try {
      this.enableLoader = true;
      
      // Prepare data for backend
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

      // Call your backend API for Google login
      this.commonService.googleLogin('google-login', googleData).subscribe(
        (response: any) => {
          this.enableLoader = false;
          
          if (response.code === 200) {
            // Store the token
            localStorage.setItem('token', response.access_token);
            
            // Store user info if provided
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
    //  await GoogleAuth.signOut();
      console.log('Google user signed out');
    } catch (error) {
      console.error('Error signing out from Google:', error);
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

  get f() { return this.loginForm.controls; }

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

  login() {
    this.submitted = true;
    if (this.loginForm.invalid) {
      return;
    }
    let data = {
      email: this.f['email'].value,
      password: this.f['password'].value,
    };
    this.enableLoader = true;
    let url = 'login';
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

  goToLogin(){
    this.router.navigate(['/login']);
  }

  goToRegister(){
    this.router.navigate(['/register']);
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
