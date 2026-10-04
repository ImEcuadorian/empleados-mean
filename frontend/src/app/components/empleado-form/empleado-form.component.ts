import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Output
} from '@angular/core';

import { NgForm } from '@angular/forms';

import {
  NuevoEmpleado
} from '../../models/empleado';

@Component({
  selector: 'app-empleado-form',
  templateUrl: './empleado-form.component.html',
  styleUrl: './empleado-form.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EmpleadoFormComponent {

  @Output()
  readonly crear =
    new EventEmitter<NuevoEmpleado>();

  empleado: NuevoEmpleado = {
    nombre: '',
    cargo: '',
    departamento: '',
    sueldo: 0
  };

  onSubmit(
    form: NgForm
  ): void {

    if (form.invalid) {
      return;
    }

    /*
     * El formulario NO llama al servicio.
     *
     * Solamente comunica hacia el padre
     * mediante @Output().
     */
    this.crear.emit({
      ...this.empleado
    });

    form.resetForm({
      nombre: '',
      cargo: '',
      departamento: '',
      sueldo: 0
    });
  }
}
