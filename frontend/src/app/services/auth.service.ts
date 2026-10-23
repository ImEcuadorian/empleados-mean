import { Injectable, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, tap } from 'rxjs';
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
    private readonly empleados: EmpleadoService) {}

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
        this.usuarioSubject.next(response.data.usuario);
        this.expirationTimer = setTimeout(() => this.logout(), response.data.expiresIn * 1000);
      }));
  }

  logout(): void {
    this.clearSession();
    void this.router.navigateByUrl('/login');
  }

  private clearSession(): void {
    clearTimeout(this.expirationTimer);
    this.token = null;
    this.expiresAt = 0;
    this.usuarioSubject.next(null);
    this.empleados.limpiar();
  }

  ngOnDestroy(): void { this.clearSession(); }
}
