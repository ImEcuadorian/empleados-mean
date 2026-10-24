import { Inject, Injectable, OnDestroy, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, catchError, map, of, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { ApiResponse } from '../models/api-response';
import { LoginResponse, Usuario } from '../models/auth';
import { EmpleadoService } from './empleado.service';

@Injectable({ providedIn: 'root' })
export class AuthService implements OnDestroy {
  private token: string | null = null;
  private expiresAt = 0;
  private expirationTimer?: ReturnType<typeof setTimeout>;
  private readonly usuarioSubject = new BehaviorSubject<Usuario | null>(null);
  readonly usuario$ = this.usuarioSubject.asObservable();

  constructor(private readonly http: HttpClient, private readonly router: Router,
    private readonly empleados: EmpleadoService,
    @Inject(PLATFORM_ID) private readonly platformId: object) {}

  private get storage(): Storage | null {
    try { return isPlatformBrowser(this.platformId) ? localStorage : null; }
    catch { return null; }
  }

  ensureSession(): Observable<boolean> {
    if (this.accessToken) return of(true);
    try {
      const saved = JSON.parse(this.storage?.getItem('empleados_session') ?? 'null');
      if (!saved || typeof saved.token !== 'string' || typeof saved.expiresAt !== 'number' ||
          saved.expiresAt <= Date.now()) { this.clearSession(); return of(false); }
      this.token = saved.token;
      this.expiresAt = saved.expiresAt;
      // Storage is untrusted: verify the token with the API before opening the route.
      return this.http.get<ApiResponse<Usuario>>(`${environment.apiUrl}/auth/me`).pipe(
        map(response => {
          if (!response.data) throw new Error('Sesión inválida');
          this.usuarioSubject.next(response.data);
          clearTimeout(this.expirationTimer);
          this.expirationTimer = setTimeout(() => this.logout(), Math.max(0, this.expiresAt - Date.now()));
          return true;
        }), catchError(() => { this.clearSession(); return of(false); })
      );
    } catch { this.clearSession(); return of(false); }
  }

  get accessToken(): string | null {
    return Date.now() < this.expiresAt ? this.token : null;
  }

  login(email: string, password: string): Observable<ApiResponse<LoginResponse>> {
    return this.http.post<ApiResponse<LoginResponse>>(`${environment.apiUrl}/auth/login`,
      { email, password }).pipe(tap(response => {
        if (!response.data) throw new Error('Respuesta de autenticación inválida');
        this.clearSession();
        this.token = response.data.token;
        this.expiresAt = Date.now() + response.data.expiresIn * 1000;
        try { this.storage?.setItem('empleados_session', JSON.stringify({ token: this.token, expiresAt: this.expiresAt })); }
        catch { /* Memory-only session when storage is unavailable. */ }
        this.usuarioSubject.next(response.data.usuario);
        this.expirationTimer = setTimeout(() => this.logout(), response.data.expiresIn * 1000);
      }));
  }

  logout(): void {
    this.clearSession();
    void this.router.navigateByUrl('/login');
  }

  private clearSession(): void {
    try { this.storage?.removeItem('empleados_session'); } catch { /* Storage disabled. */ }
    clearTimeout(this.expirationTimer);
    this.token = null;
    this.expiresAt = 0;
    this.usuarioSubject.next(null);
    this.empleados.limpiar();
  }

  ngOnDestroy(): void { clearTimeout(this.expirationTimer); }
}
