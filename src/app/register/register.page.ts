import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { IonButton, IonContent, IonHeader, IonTitle, IonToolbar, IonModal, IonInput, ModalController } from '@ionic/angular/standalone';
import { AlertController, MenuController } from '@ionic/angular';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonService } from '../services/common-service';
import { MustMatch } from '../_helper/must-match.validator';
import { AuthService } from '../services/auth.service';
import { ReferralService } from '../services/referral.service';


import { CommonModule } from '@angular/common';
import { importProvidersFrom } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { ToastModalComponent } from '../toast-modal/toast-modal.component';
import { LoaderService } from '../services/loader.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, IonInput, IonButton, IonContent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class RegisterPage implements OnInit {
  public registerForm!: FormGroup;
  public submitted: boolean = false;
  constructor(
    private formBuilder: FormBuilder,
    public router: Router,
    public modalController: ModalController,
    public activatedRoute: ActivatedRoute,
    private menu: MenuController,
    private commonService: CommonService,
    private authenticationService: AuthService,
    private alertController: AlertController,
    private loaderService: LoaderService,
    private referralService: ReferralService
  ) {

    this.activatedRoute.params.subscribe(async val => {
      let hasLoggin: any = await this.alreadyLoggedIn();
      if (hasLoggin.status === 200) {
        this.router.navigate(['/dashboard'])
      }
    });
  }

  async ngOnInit() {
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

    // Check for referral code from URL params or stored referral
    await this.checkForReferralCode();
  }

  get f() { return this.registerForm.controls; }

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

  goToLogin() {
    this.router.navigate(['/login']);
  }

  goToRegister() {
    this.router.navigate(['/register']);
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

  register() {
    this.submitted = true;
    if (this.registerForm.invalid) {
      return;
    }
    let data = {
      first_name: this.f['firstName'].value,
      last_name: this.f['lastName'].value,
      full_name: `${this.f['firstName'].value}  ${this.f['lastName'].value}`,
      email: this.f['email'].value,
      phone: this.f['phone'].value,
      country_code: "+91",
      password: this.f['password'].value,
      referral_code: this.f['referralCode'].value || null
    };
    this.loaderService.show();
    let url = 'registration';
    this.commonService.login(url, data).subscribe(
      (response: any) => {
        this.loaderService.hide();
        if (response.code == 201) {
            this.showToast('success', response.message, '', 2500, '/login');
          localStorage.setItem('token', response.access_token);
        } else if (response.code == 423) {
          this.showToast('error', response.message, '', 2500, '');
        }else{
          this.showToast('error', response.message, '', 2500, '');
        }
      },
      (error) => {
        this.loaderService.hide();
        console.log('error ts: ', error.error);
        // this.toastr.error(error);
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
