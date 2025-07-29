import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { IonButton, IonButtons, IonContent, IonHeader, IonTitle, AlertController, IonInput, ModalController, ActionSheetController, IonIcon, IonItem, IonLabel, IonSelect, IonSelectOption } from '@ionic/angular/standalone';

import { IonicModule } from '@ionic/angular';
import { CommonService } from '../services/common-service';
import { ToastModalComponent } from '../toast-modal/toast-modal.component';
import { Router } from '@angular/router';
@Component({
  selector: 'app-account',
  templateUrl: './account.page.html',
  styleUrls: ['./account.page.scss'],
  standalone: true,
  imports: [ IonicModule, FormsModule, ReactiveFormsModule, CommonModule ]
})
export class AccountPage implements OnInit {

  constructor(public router: Router,
    private formBuilder: FormBuilder,
    private commonService: CommonService,
    public modalController: ModalController,
     private alertController: AlertController,) { }

  ngOnInit() {
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
          handler: (blah:any) => {

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
    this.commonService.post(url, {}).subscribe((response:any) => {
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
