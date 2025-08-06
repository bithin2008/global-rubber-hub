import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { IonButton, IonButtons, IonContent, IonHeader, IonTitle, AlertController, IonInput, ModalController, ActionSheetController, IonIcon, IonItem, IonLabel, IonSelect, IonSelectOption, IonBackButton, IonToolbar } from '@ionic/angular/standalone';

import { IonicModule } from '@ionic/angular';
import { CommonService } from '../services/common-service';
import { ToastModalComponent } from '../toast-modal/toast-modal.component';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { HeaderComponent } from '../shared/header/header.component';
import { FooterComponent } from '../shared/footer/footer.component';
import { ProfileService } from '../services/profile.service';
import { Subscription } from 'rxjs';
import { PageTitleService } from '../services/page-title.service';
@Component({
  selector: 'app-account',
  templateUrl: './account.page.html',
  styleUrls: ['./account.page.scss'],
  standalone: true,
  imports: [ IonicModule, FormsModule, ReactiveFormsModule, CommonModule, HeaderComponent, FooterComponent ]
})
export class AccountPage implements OnInit, OnDestroy {
  public enableLoader: boolean = false;
  public profileImage: string = '';
  public showPlaceholder: boolean = true;
  public profileDetails:any={}
  private subscription: Subscription = new Subscription();


  constructor(public router: Router,
    private formBuilder: FormBuilder,
    private commonService: CommonService,
    public modalController: ModalController,
     private alertController: AlertController,
     private location: Location,
     private pageTitleService: PageTitleService,
     private profileService: ProfileService) { }

  ngOnInit() {
    this.pageTitleService.setPageTitle('Account');
    this.getProfileData();
    
    // Subscribe to profile image changes from the service
    this.subscription.add(
      this.profileService.profileImage$.subscribe((imageUrl) => {
        this.profileImage = imageUrl;
        this.showPlaceholder = !imageUrl;
      })
    );
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  getProfileData() {
    this.enableLoader = true;
    let url = 'user/profile';
    this.commonService.get(url).subscribe(
      (response: any) => {
        this.enableLoader = false;
        if (response.code == 200) {
          this.profileDetails=response.user;
          // Set profile image if available, otherwise show placeholder
          if (response.user.profile_image && response.user.profile_image.trim() !== '') {
            this.profileImage = response.user.profile_image;
            this.showPlaceholder = false;
            // Update the service so header reflects the change
            this.profileService.updateProfileImage(response.user.profile_image);
          } else {
            this.profileImage = '';
            this.showPlaceholder = true;
            // Clear the service as well
            this.profileService.updateProfileImage('');
          }
          // Update user name in service if available
          if (response.user.full_name) {
            this.profileService.updateUserName(response.user.full_name);
          }
         
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



  goToEditProfile(){
    this.router.navigate(['/profile']);
  }

  goBack() {
    this.location.back();
  }

  onImageError(event: Event) {
    this.profileImage = ''; // Clear the image source
    this.showPlaceholder = true; // Show placeholder
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
