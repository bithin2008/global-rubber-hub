import { Injectable } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { NoInternetComponent } from '../components/no-internet/no-internet.component';
import { InternetService } from './internet.service';

@Injectable({
  providedIn: 'root'
})
export class NetworkStatusService {
  private noInternetModal: any = null;

  constructor(
    private modalController: ModalController,
    private internetService: InternetService
  ) {
    // Listen for internet status changes
    this.internetService.isOnline$.subscribe((isOnline) => {
      if (!isOnline && !this.noInternetModal) {
        this.showNoInternetPage();
      } else if (isOnline && this.noInternetModal) {
        this.hideNoInternetPage();
      }
    });
  }

  async showNoInternetPage() {
    if (this.noInternetModal) {
      return; // Modal already showing
    }

    try {
      this.noInternetModal = await this.modalController.create({
        component: NoInternetComponent,
        cssClass: 'no-internet-modal',
        backdropDismiss: false,
        showBackdrop: true,
        componentProps: {}
      });

      await this.noInternetModal.present();

      // Listen for when the modal is dismissed
      this.noInternetModal.onDidDismiss().then(() => {
        this.noInternetModal = null;
      });
    } catch (error) {
      console.error('Error showing no internet page:', error);
    }
  }

  async hideNoInternetPage() {
    if (this.noInternetModal) {
      try {
        await this.noInternetModal.dismiss();
        this.noInternetModal = null;
      } catch (error) {
        console.error('Error hiding no internet page:', error);
      }
    }
  }

  async checkAndShowIfOffline() {
    const isOnline = await this.internetService.checkConnection();
    if (!isOnline) {
      this.showNoInternetPage();
    }
    return isOnline;
  }
}

