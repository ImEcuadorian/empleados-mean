import { inject } from '@angular/core';
import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { environment } from '../../environments/environment';

export const authInterceptor: HttpInterceptorFn = (request, next) => {
  const auth = inject(AuthService);
  const isApi = request.url.startsWith(`${environment.apiUrl}/`);
  const token = auth.accessToken;
  const authenticatedRequest = isApi && token
    ? request.clone({ setHeaders: { Authorization: `Bearer ${token}` } }) : request;
  return next(authenticatedRequest).pipe(catchError((error: unknown) => {
    // Do not let a late response from a previous session close a new one.
    if (isApi && token && auth.accessToken === token &&
      error instanceof HttpErrorResponse && error.status === 401) auth.logout();
    return throwError(() => error);
  }));
};
