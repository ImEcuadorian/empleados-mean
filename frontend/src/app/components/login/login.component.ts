import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { finalize } from 'rxjs';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  email = '';
  password = '';
  loading = false;
  error = '';

  constructor(private readonly auth: AuthService, private readonly router: Router) {}

  iniciarSesion(): void {
    if (this.loading) return;
    this.loading = true;
    this.error = '';
    this.auth.login(this.email.trim(), this.password).pipe(
      finalize(() => { this.loading = false; this.password = ''; })
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
