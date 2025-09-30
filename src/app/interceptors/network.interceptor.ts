import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { InternetService } from '../services/internet.service';
import { ModalController } from '@ionic/angular';
import { NoInternetComponent } from '../components/no-internet/no-internet.component';

export const NetworkInterceptor: HttpInterceptorFn = (req, next) => {
  const internetService = inject(InternetService);
  const modalController = inject(ModalController);
  let noInternetModal: any = null;

  const isNetworkError = (error: HttpErrorResponse): boolean => {
    // Check for various network error conditions
    return (
      !navigator.onLine ||
      error.status === 0 ||
      error.status === 408 ||
      error.status === 504 ||
      error.status === 503 ||
      error.status === 502 ||
      error.status === 500 ||
      (error as any).name === 'NetworkError' ||
      error.message.includes('Network Error') ||
      error.message.includes('Failed to fetch') ||
      error.message.includes('ERR_INTERNET_DISCONNECTED') ||
      error.message.includes('ERR_NETWORK_CHANGED')
    );
  };

  const showNoInternetModal = async () => {
    if (noInternetModal) {
      return; // Modal already showing
    }

    try {
      noInternetModal = await modalController.create({
        component: NoInternetComponent,
        cssClass: 'no-internet-modal',
        backdropDismiss: false,
        showBackdrop: true,
        componentProps: {}
      });

      await noInternetModal.present();

      // Listen for when the modal is dismissed
      noInternetModal.onDidDismiss().then(() => {
        noInternetModal = null;
      });
    } catch (error) {
      console.error('Error showing no internet modal:', error);
    }
  };

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // Check if it's a network error
      if (isNetworkError(error)) {
        showNoInternetModal();
      }
      return throwError(() => error);
    })
  );
};
