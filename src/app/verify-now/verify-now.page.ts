import { Component, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonButton, IonIcon, IonList, IonItem, IonLabel, ModalController } from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { CommonService } from '../services/common-service';
import { ToastModalComponent } from '../toast-modal/toast-modal.component';

@Component({
  selector: 'app-verify-now',
  templateUrl: './verify-now.page.html',
  styleUrls: ['./verify-now.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, IonButtons, IonButton, IonIcon, IonList, IonItem, IonLabel]
})
export class VerifyNowPage implements OnInit {
  public enableLoader: boolean = false;
  public profileDetails: any = {};
  constructor(private location: Location, private router: Router, private commonService: CommonService, private modalController: ModalController) { }

  ngOnInit() {
    this.getProfileData();
  }

  goBack() {
    this.location.back();
  }

  goToPan() {
    this.router.navigate(['/verify-inner']);
  }

  goToGSTUdyam(){
    if(this.profileDetails.pan== null || this.profileDetails.pan== ''){
      this.showToast('warning', 'Please verify your PAN first', '', 3500, '');
      return;
    }
    this.router.navigate(['/gst-udyam-verification']);
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

  goToTrustedSeller(){
    if(this.profileDetails.pan== null || this.profileDetails.pan== ''){
      this.showToast('warning', 'Please verify your PAN first', '', 3500, '');
      return;
    }

    if(this.profileDetails.pan== null || this.profileDetails.pan== ''){
      this.showToast('warning', 'GST/Udyam / Farmer ID is not verified', '', 3500, '');
      return;
    }
    this.router.navigate(['/trusted-seller']);
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
