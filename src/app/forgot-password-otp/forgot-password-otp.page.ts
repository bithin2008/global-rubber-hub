import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { IonButton, IonContent, IonHeader, IonTitle, IonToolbar, IonModal, IonInput, ModalController } from '@ionic/angular/standalone';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { CommonService } from '../services/common-service';
import { ToastModalComponent } from '../toast-modal/toast-modal.component';
import { IonicModule } from '@ionic/angular';
import { NgOtpInputComponent } from 'ng-otp-input';
@Component({
  selector: 'app-forgot-password-otp',
  templateUrl: './forgot-password-otp.page.html',
  styleUrls: ['./forgot-password-otp.page.scss'],
  standalone: true,
  imports: [ IonicModule,RouterModule, FormsModule, ReactiveFormsModule, CommonModule, NgOtpInputComponent ],
})
export class ForgotPasswordOtpPage implements OnInit {

  public enableLoader: boolean = false;
  public forgotPasswordForm!: FormGroup;
  public submitted: boolean = false;
  public loginType = 'company'
  constructor(
    private formBuilder: FormBuilder,
    public router: Router,
    public modalController: ModalController,
    public activatedRoute: ActivatedRoute,
    private commonService: CommonService,
    private authenticationService: AuthService
  ) {

    this.activatedRoute.params.subscribe(async val => {
      let hasLoggin: any = await this.alreadyLoggedIn();
      if (hasLoggin.status === 200) {
        this.router.navigate(['/dashboard'])
      }
    });
  }

  //amaleshdebnath68394@gmail.com
  //Amalesh@goo2022
  ngOnInit() {    
    this.forgotPasswordForm = this.formBuilder.group({
      emailOTP: ['', [Validators.required]]
    });
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

  get f() { return this.forgotPasswordForm.controls; }

  onOtpChange(ev:any){
    this.forgotPasswordForm.patchValue({emailOTP:ev})
  }

  forgotPassword() {
    this.submitted = true;
    if (this.forgotPasswordForm.invalid) {
      return;
    }
    let data = {
      email: localStorage.getItem('email'),
      otp:this.f['emailOTP'].value,
    };
    this.enableLoader = true;
    let url = 'auth/verify-otp';
    this.commonService.login(url, data).subscribe(
      (response: any) => {
        this.enableLoader = false;
        if (response.code == 200) {         
          this.showToast('success', response.message, '', 2000, '/reset-password');
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
