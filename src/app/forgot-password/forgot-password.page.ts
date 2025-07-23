import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { IonButton, IonContent, IonHeader, IonTitle, IonToolbar, IonModal, IonInput, ModalController } from '@ionic/angular/standalone';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { CommonService } from '../services/common-service';
import { ToastModalComponent } from '../toast-modal/toast-modal.component';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.page.html',
  styleUrls: ['./forgot-password.page.scss'],
  standalone: true,
  imports: [IonContent,RouterModule, CommonModule, FormsModule,ReactiveFormsModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class ForgotPasswordPage implements OnInit {

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
      email: ['', [Validators.required, Validators.pattern(/^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i)]]
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



  forgotPassword() {
    this.submitted = true;
    if (this.forgotPasswordForm.invalid) {
      return;
    }
    let data = {
      email_id: this.f['email'].value
    };
    this.enableLoader = true;
    let url = 'forgot-password';
    this.commonService.login(url, data).subscribe(
      (response: any) => {
        this.enableLoader = false;
        if (response.status == 200) {
          localStorage.setItem('token', response.access_token);
          this.showToast('success', response.message, '', 1500, '/login');
        } else if (response.status == 401) {
          this.showToast('error', response.message, '', 2000, '');
        } else if (response.status == 423) {
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
