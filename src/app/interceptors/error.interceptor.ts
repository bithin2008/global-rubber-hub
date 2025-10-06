import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { ModalController } from '@ionic/angular';
import { ToastModalComponent } from '../toast-modal/toast-modal.component';

export const ErrorInterceptor: HttpInterceptorFn = (req, next) => {
  const modalController = inject(ModalController);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let message = 'Something went wrong. Please try again.';

      if (error.error) {
        if (typeof error.error === 'string' && error.error.trim().length > 0) {
          message = error.error;
        } else if (typeof error.error === 'object') {
          if (error.error.message) {
            message = error.error.message;
          } else if (error.message) {
            message = error.message;
          }
        } else if (error.message) {
          message = error.message;
        }
      } else if (error.message) {
        message = error.message;
      }

      // Map common HTTP status codes to friendly messages (fallbacks)
      if (error.status === 0) {
        message = 'Network error. Check your connection.';
      } else if (error.status === 401) {
        // Let Auth interceptor handle session expiry; show minimal info here
        message = message || 'Unauthorized request.';
      } else if (error.status === 403) {
        message =  message || 'You do not have permission to perform this action.';
      } else if (error.status === 404) {
        message =  message || 'Requested resource was not found.';
      } else if (error.status >= 500) {
        message =  message || 'Server error. Please try again later.';
      }

      // Show the shared ToastModalComponent instead of a toast
      try {
        // Do not await: we don't want to block the error propagation
        (async () => {
          console.log('ErrorInterceptor - Creating modal with message:', message);
          const modal = await modalController.create({
            component: ToastModalComponent,
            cssClass: 'toast-modal',
            componentProps: {
              status: 'error',
              message: message,
              submessage: '',
              timer: 3000,
              redirect: ''
            }
          });
          console.log('ErrorInterceptor - Modal created, presenting...');
          await modal.present();
          console.log('ErrorInterceptor - Modal presented');
        })();
      } catch (error) {
        console.error('ErrorInterceptor - Failed to create/present modal:', error);
      }

      return throwError(() => error);
    })
  );
};


