import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { finalize, map } from 'rxjs';
import { Empleado, NuevoEmpleado } from '../../models/empleado';
import { EmpleadoService } from '../../services/empleado.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-empleado',
  templateUrl: './empleado.component.html',
  styleUrl: './empleado.component.css',
})
export class EmpleadoComponent implements OnInit {
  readonly soloLectura = this.route.snapshot.data['publico'] === true;
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
  editando: Empleado | null = null;
  guardando = false;
  eliminandoId: string | null = null;
  formularioVersion = 0;
  error = '';
  mensaje = '';

  constructor(
    readonly auth: AuthService,
    private readonly empleadoService: EmpleadoService,
    private readonly route: ActivatedRoute,
    @Inject(PLATFORM_ID) private readonly platformId: object,
  ) {}

  ngOnInit(): void {
    // Vercel serves the prerendered shell; the browser loads the current directory.
    if (!isPlatformBrowser(this.platformId)) return;
    this.empleadoService.cargarEmpleados().subscribe({
      error: () => {
        this.error =
          'No pudimos cargar el directorio. Intenta actualizar la página en unos momentos.';
      },
    });
  }

  editarEmpleado(empleado: Empleado): void {
    if (this.soloLectura || this.guardando || this.eliminandoId) return;
    this.editando = empleado;
    this.error = '';
    this.mensaje = '';
  }

  cancelarEdicion(): void {
    if (this.guardando) return;
    this.editando = null;
    this.error = '';
  }

  guardarEmpleado(empleado: NuevoEmpleado): void {
    if (this.soloLectura || this.guardando || this.eliminandoId) return;
    const id = this.editando?.id;
    this.guardando = true;
    this.error = '';
    this.mensaje = '';
    const operacion = id
      ? this.empleadoService.actualizarEmpleado(id, empleado)
      : this.empleadoService.crearEmpleado(empleado);
    operacion
      .pipe(
        finalize(() => {
          this.guardando = false;
        }),
      )
      .subscribe({
        next: () => {
          this.editando = null;
          this.formularioVersion++;
          this.mensaje = id
            ? 'Cambios guardados correctamente.'
            : 'Empleado agregado al equipo.';
        },
        error: () => {
          this.error =
            'No pudimos guardar los datos. Revisa los campos y la conexión e inténtalo nuevamente.';
        },
      });
  }

  eliminarEmpleado(id: string): void {
    if (this.soloLectura || this.guardando || this.eliminandoId) return;
    this.error = '';
    this.mensaje = '';
    this.eliminandoId = id;
    this.empleadoService
      .eliminarEmpleado(id)
      .pipe(
        finalize(() => {
          this.eliminandoId = null;
        }),
      )
      .subscribe({
        next: () => {
          if (this.editando?.id === id) this.editando = null;
          this.mensaje = 'Empleado eliminado correctamente.';
        },
        error: () => {
          this.error =
            'No pudimos eliminar el empleado. Inténtalo nuevamente en unos momentos.';
        },
      });
  }
}
