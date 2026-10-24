import { Component, OnInit } from '@angular/core';

import { NuevoEmpleado } from '../../models/empleado';

import { EmpleadoService } from '../../services/empleado.service';
import { AuthService } from '../../services/auth.service';
import { map } from 'rxjs';

@Component({
  selector: 'app-empleado',
  templateUrl: './empleado.component.html',
  styleUrl: './empleado.component.css',
})
export class EmpleadoComponent implements OnInit {
  /*
   * El Smart Component conoce
   * el servicio.
   */
  readonly empleados$ = this.empleadoService.empleados$;

  readonly resumen$ = this.empleados$.pipe(
    map((empleados) => ({
      empleados,
      total: empleados.length,
      departamentos: new Set(
        empleados.map((empleado) =>
          empleado.departamento.trim().toLocaleLowerCase(),
        ),
      ).size,
      nomina: empleados.reduce((total, empleado) => total + empleado.sueldo, 0),
    })),
  );
  error = '';

  constructor(
    readonly auth: AuthService,
    private readonly empleadoService: EmpleadoService,
  ) {}

  ngOnInit(): void {
    this.empleadoService.cargarEmpleados().subscribe({
      error: (error) => {
        this.error =
          'No pudimos cargar el directorio. Intenta actualizar la página en unos momentos.';
        console.error('Error al cargar empleados:', error);
      },
    });
  }

  crearEmpleado(empleado: NuevoEmpleado): void {
    this.error = '';
    this.empleadoService.crearEmpleado(empleado).subscribe({
      error: (error) => {
        this.error =
          'No pudimos guardar el empleado. Comprueba la conexión e inténtalo nuevamente.';
        console.error('Error al crear empleado:', error);
      },
    });
  }

  eliminarEmpleado(id: string): void {
    this.error = '';
    this.empleadoService.eliminarEmpleado(id).subscribe({
      error: (error) => {
        this.error =
          'No pudimos eliminar el empleado. Inténtalo nuevamente en unos momentos.';
        console.error('Error al eliminar empleado:', error);
      },
    });
  }
}
