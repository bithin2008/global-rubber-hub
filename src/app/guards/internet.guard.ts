import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { InternetService } from '../services/internet.service';
import { ModalController } from '@ionic/angular';
import { NoInternetComponent } from '../components/no-internet/no-internet.component';

@Injectable({
  providedIn: 'root'
})
export class InternetGuard implements CanActivate {
  private noInternetModal: any = null;

  constructor(
    private internetService: InternetService,
    private router: Router,
    private modalController: ModalController
  ) {
    // Listen for internet status changes
    this.internetService.isOnline$.subscribe((isOnline) => {
      if (!isOnline && !this.noInternetModal) {
        this.showNoInternetModal();
      } else if (isOnline && this.noInternetModal) {
        this.hideNoInternetModal();
      }
    });
  }

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean {
    const isOnline = this.internetService.isOnline;
    
    if (!isOnline) {
      this.showNoInternetModal();
      return false;
    }
    
    return true;
  }

  private async showNoInternetModal() {
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
    } catch (error) {
      console.error('Error showing no internet modal:', error);
    }
  }

  private async hideNoInternetModal() {
    if (this.noInternetModal) {
      try {
        await this.noInternetModal.dismiss();
        this.noInternetModal = null;
      } catch (error) {
        console.error('Error hiding no internet modal:', error);
      }
    }
  }
}

