import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { NgForm } from '@angular/forms';
import { Empleado, NuevoEmpleado } from '../../models/empleado';

@Component({
  selector: 'app-empleado-form',
  templateUrl: './empleado-form.component.html',
  styleUrl: './empleado-form.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EmpleadoFormComponent implements OnChanges {
  @Input() seleccionado: Empleado | null = null;
  @Input() guardando = false;
  @Input() version = 0;
  @Output() readonly guardar = new EventEmitter<NuevoEmpleado>();
  @Output() readonly cancelar = new EventEmitter<void>();
  @ViewChild('empleadoForm') private formulario?: NgForm;
  empleado: NuevoEmpleado = this.vacio();

  ngOnChanges(changes: SimpleChanges): void {
    if (!changes['seleccionado'] && !changes['version']) return;
    const elegido = this.seleccionado;
    this.empleado = elegido
      ? {
          nombre: elegido.nombre,
          cargo: elegido.cargo,
          departamento: elegido.departamento,
          sueldo: elegido.sueldo,
        }
      : this.vacio();
    this.formulario?.resetForm(this.empleado);
  }

  onSubmit(form: NgForm): void {
    if (form.invalid || this.guardando) return;
    this.guardar.emit({
      ...this.empleado,
      nombre: this.empleado.nombre.trim(),
      cargo: this.empleado.cargo.trim(),
      departamento: this.empleado.departamento.trim(),
    });
  }

  private vacio(): NuevoEmpleado {
    return { nombre: '', cargo: '', departamento: '', sueldo: 0 };
  }
}
