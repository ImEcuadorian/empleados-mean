import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { LoginComponent } from './components/login/login.component';
import { EmpleadoComponent } from './components/empleado/empleado.component';
import { authGuard } from './guards/auth.guard';

const routes: Routes = [
  { path: 'auth', redirectTo: 'login', pathMatch: 'full' },
  { path: 'employees', redirectTo: 'empleados', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'directorio', component: EmpleadoComponent, data: { publico: true } },
  { path: 'empleados', component: EmpleadoComponent, canActivate: [authGuard] },
  { path: '', redirectTo: 'directorio', pathMatch: 'full' },
  { path: '**', redirectTo: 'directorio' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
