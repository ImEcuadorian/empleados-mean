import { Component, EventEmitter, Input, Output } from '@angular/core';

export interface LoginCredentials { email: string; password: string; }

@Component({
  selector: 'app-login-form',
  templateUrl: './login-form.component.html',
  styleUrl: '../login/login.component.css'
})
export class LoginFormComponent {
  @Input() loading = false;
  @Output() submitLogin = new EventEmitter<LoginCredentials>();
  email = '';
  password = '';

  submit(): void {
    if (!this.loading && this.email && this.password) {
      this.submitLogin.emit({ email: this.email.trim(), password: this.password });
      this.password = '';
    }
  }
}
