import { Component, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonButton, IonIcon, IonFooter, IonItem, IonLabel, IonInput, IonRadio, IonRadioGroup } from '@ionic/angular/standalone';
import { Icon } from 'ionicons/dist/types/components/icon/icon';

@Component({
  selector: 'app-gst-udyam-verification',
  templateUrl: './gst-udyam-verification.page.html',
  styleUrls: ['./gst-udyam-verification.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, IonButtons, IonButton, IonIcon, IonFooter, IonItem, IonLabel, IonInput, IonRadio, IonRadioGroup]
})
export class GstUdyamVerificationPage implements OnInit {

  selectedVerificationType: string = 'gst';
  verificationNumber: string = '';
  isFormValid: boolean = false;

  constructor(private location: Location) { }

  ngOnInit() {
  }

  goBack() {
    this.location.back();
  }

  onVerificationTypeChange(type: string) {
    this.selectedVerificationType = type;
    this.verificationNumber = '';
    this.validateForm();
  }

  onVerificationNumberChange() {
    this.validateForm();
  }

  validateForm() {
    if (!this.selectedVerificationType || !this.verificationNumber) {
      this.isFormValid = false;
      return;
    }

    switch (this.selectedVerificationType) {
      case 'gst':
        // GST number validation: 15 characters, 2 digits + 10 characters + 1 digit + 1 character
        const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
        this.isFormValid = gstRegex.test(this.verificationNumber);
        break;
      case 'udyam':
        // Udyam number validation: 19 digits
        const udyamRegex = /^[0-9]{19}$/;
        this.isFormValid = udyamRegex.test(this.verificationNumber);
        break;
      case 'farmer':
        // Farmer ID validation: 12 digits
        const farmerRegex = /^[0-9]{12}$/;
        this.isFormValid = farmerRegex.test(this.verificationNumber);
        break;
      default:
        this.isFormValid = false;
    }
  }

  getPlaceholderText(): string {
    switch (this.selectedVerificationType) {
      case 'gst':
        return 'Enter 15 digit GST Number (e.g., 22AAAAA0000A1Z5)';
      case 'udyam':
        return 'Enter 19 digit Udyam Number';
      case 'farmer':
        return 'Enter 12 digit Farmer ID';
      default:
        return 'Select verification type first';
    }
  }

  getLabelText(): string {
    switch (this.selectedVerificationType) {
      case 'gst':
        return 'GST Number*';
      case 'udyam':
        return 'Udyam Number*';
      case 'farmer':
        return 'Farmer ID*';
      default:
        return 'Verification Number*';
    }
  }

  getOTP() {
    if (this.isFormValid) {
      console.log('Getting OTP for:', this.selectedVerificationType, this.verificationNumber);
      // Add your OTP logic here
    }
  }
}


