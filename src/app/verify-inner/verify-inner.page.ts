import { Component, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonButton, IonIcon, IonFooter, IonItem, IonLabel, IonInput, LoadingController, ToastController, ModalController } from '@ionic/angular/standalone';
import { Icon } from 'ionicons/dist/types/components/icon/icon';
import { CommonService } from '../services/common-service';
import { ToastModalComponent } from '../toast-modal/toast-modal.component';

@Component({
  selector: 'app-verify-inner',
  templateUrl: './verify-inner.page.html',
  styleUrls: ['./verify-inner.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, IonButtons, IonButton, IonIcon, IonFooter, IonItem, IonLabel, IonInput]
})
export class VerifyInnerPage implements OnInit {

  panNumber: string = '';
  isFormValid: boolean = false;
  showPanError: boolean = false;
  public enableLoader: boolean = false;

  constructor(
    private location: Location,
    private commonService: CommonService,
    private modalController: ModalController,
    private loadingController: LoadingController,
    private toastController: ToastController
  ) { }

  ngOnInit() {
    // Initial form validation
    this.validateForm();
  }

  goBack() {
    this.location.back();
  }

  onPanNumberChange() {
    // Convert to uppercase immediately
    this.panNumber = this.panNumber.toUpperCase();
    this.validateForm();
    // Hide error when user starts typing
    if (this.panNumber) {
      this.showPanError = false;
    }
  }

  buttonKeyPress(event: KeyboardEvent) {
    const char = event.key;
    
    // Allow control keys (backspace, delete, etc.) regardless of length
    if (['Backspace', 'Delete', 'Tab', 'Enter', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(char)) {
      return true;
    }
    
    // Prevent input if already at 10 characters (unless it's a control key)
    if (this.panNumber.length >= 10) {
      event.preventDefault();
      return false;
    }
    
    // Allow only uppercase letters and numbers
    if (!/^[A-Z0-9]$/.test(char)) {
      event.preventDefault();
      return false;
    }
    
    // Convert to uppercase if it's a letter
    if (/^[a-z]$/.test(char)) {
      event.preventDefault();
      this.panNumber += char.toUpperCase();
      return false;
    }
    
    return true;
  }

  validateForm() {
    if (!this.panNumber) {
      this.isFormValid = false;
      return;
    }

    // PAN number validation: 10 characters (5 letters + 4 digits + 1 letter)
    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
    this.isFormValid = panRegex.test(this.panNumber.toUpperCase());
  }

  async verifyNow() {
    // Check if PAN number is empty
    if (!this.panNumber || this.panNumber.trim() === '') {
      this.showPanError = true;
      return;
    }
    
    // Check if PAN number is valid
    if (!this.isFormValid) {
      this.showPanError = true;
      return;
    }
    try {
      let url = `general/verify-pan-gst-udyam`;
      let data = {
        type: 'pan',
        doc_number: this.panNumber.toUpperCase()
      }
      this.enableLoader = true;
      this.commonService.post(url, data).subscribe(
        (response: any) => {
          this.enableLoader = false;
          if (response.code == 200) {
            this.showToast('success', response.message, '', 3500, '/account');
           // this.profileDetails = response.user;
          } else {
            this.showToast('error', response.message, '', 3500, '');
          }
        },
        (error) => {
          this.enableLoader = false;
          console.log('error', error);
        }
      );

    } catch (error: any) {   

      await this.showToast('error', error.error.message, '', 3000, '');
    }
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
