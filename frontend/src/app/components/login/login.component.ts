import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { finalize } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { LoginCredentials } from '../login-form/login-form.component';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  loading = false;
  error = '';

  constructor(private readonly auth: AuthService, private readonly router: Router) {}

  iniciarSesion(credentials: LoginCredentials): void {
    if (this.loading) return;
    this.loading = true;
    this.error = '';
    this.auth.login(credentials.email, credentials.password).pipe(
      finalize(() => { this.loading = false; })
    ).subscribe({
      next: () => { void this.router.navigateByUrl('/empleados'); },
      error: (error: HttpErrorResponse) => {
        this.error = error.status === 401 ? 'Correo o contraseña incorrectos.' :
          error.status === 429 ? 'Demasiados intentos. Espera 15 minutos.' :
          error.status === 400 ? 'Revisa el correo y la contraseña.' :
          'No se pudo iniciar sesión. Comprueba la conexión con el servidor.';
      }
    });
  }
}
