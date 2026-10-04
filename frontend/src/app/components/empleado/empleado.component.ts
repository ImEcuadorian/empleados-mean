import {
  Component,
  OnInit
} from '@angular/core';

import {
  NuevoEmpleado
} from '../../models/empleado';

import {
  EmpleadoService
} from '../../services/empleado.service';

@Component({
  selector: 'app-empleado',
  templateUrl: './empleado.component.html',
  styleUrl: './empleado.component.css'
})
export class EmpleadoComponent
  implements OnInit {

  /*
   * El Smart Component conoce
   * el servicio.
   */
  readonly empleados$ =
    this.empleadoService.empleados$;

  constructor(
    private readonly empleadoService:
    EmpleadoService
  ) {}

  ngOnInit(): void {

    this.empleadoService
      .cargarEmpleados()
      .subscribe({
        error: (error) => {
          console.error(
            'Error al cargar empleados:',
            error
          );
        }
      });
  }

  crearEmpleado(
    empleado: NuevoEmpleado
  ): void {

    this.empleadoService
      .crearEmpleado(empleado)
      .subscribe({
        error: (error) => {
          console.error(
            'Error al crear empleado:',
            error
          );
        }
      });
  }

  eliminarEmpleado(
    id: string
  ): void {

    this.empleadoService
      .eliminarEmpleado(id)
      .subscribe({
        error: (error) => {
          console.error(
            'Error al eliminar empleado:',
            error
          );
        }
      });
  }
}
