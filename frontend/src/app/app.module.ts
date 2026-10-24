import { NgModule } from '@angular/core';
import {
  BrowserModule
} from '@angular/platform-browser';

import {
  provideHttpClient,
  withFetch,
  withInterceptors
} from '@angular/common/http';

import { FormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { EmpleadoComponent } from './components/empleado/empleado.component';
import { EmpleadoFormComponent } from './components/empleado-form/empleado-form.component';
import { EmpleadoListComponent } from './components/empleado-list/empleado-list.component';
import { LoginComponent } from './components/login/login.component';
import { LoginFormComponent } from './components/login-form/login-form.component';
import { authInterceptor } from './interceptors/auth.interceptor';

@NgModule({
  declarations: [
    AppComponent,
    EmpleadoComponent,
    EmpleadoFormComponent,
    EmpleadoListComponent,
    LoginComponent,
    LoginFormComponent
  ],

  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule
  ],

  providers: [
    provideHttpClient(withFetch(), withInterceptors([authInterceptor]))
  ],

  bootstrap: [
    AppComponent
  ]
})
export class AppModule {}
