import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { AuthGuardService } from '../services/auth-guard.service';

export const AuthInterceptor: HttpInterceptorFn = (req, next) => {
  const authGuardService = inject(AuthGuardService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // Handle 401 Unauthorized errors
      if (error.status === 401) {
        console.log('401 error intercepted, handling authentication failure');
        authGuardService.handle401Error('Session expired. Please login again');
      }
      
      return throwError(() => error);
    })
  );
};
