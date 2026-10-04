import {
  Component,
  OnInit
} from '@angular/core';

import { NgForm } from '@angular/forms';

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
   * El componente NO almacena
   * el arreglo de empleados.
   *
   * Solo expone el Observable
   * del servicio.
   */
  readonly empleados$ =
    this.empleadoService.empleados$;

  formEmpleado: NuevoEmpleado = {
    nombre: '',
    cargo: '',
    departamento: '',
    sueldo: 0
  };

  constructor(
    private readonly empleadoService:
    EmpleadoService
  ) {}

  ngOnInit(): void {
    this.cargarEmpleados();
  }

  cargarEmpleados(): void {

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

  addEmpleado(
    form: NgForm
  ): void {

    if (form.invalid) {
      return;
    }

    this.empleadoService
      .crearEmpleado({
        ...this.formEmpleado
      })
      .subscribe({
        next: () => {

          form.resetForm({
            nombre: '',
            cargo: '',
            departamento: '',
            sueldo: 0
          });
        },

        error: (error) => {
          console.error(
            'Error al crear empleado:',
            error
          );
        }
      });
  }

  eliminarEmpleado(
    id?: string
  ): void {

    if (!id) {
      return;
    }

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
