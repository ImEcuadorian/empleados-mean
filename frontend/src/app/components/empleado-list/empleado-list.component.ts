import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output
} from '@angular/core';

import {
  Empleado
} from '../../models/empleado';

@Component({
  selector: 'app-empleado-list',
  templateUrl: './empleado-list.component.html',
  styleUrl: './empleado-list.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EmpleadoListComponent {

  @Input({
    required: true
  })
  empleados: readonly Empleado[] = [];

  @Output()
  readonly eliminar =
    new EventEmitter<string>();

  onEliminar(
    id?: string
  ): void {

    if (!id) {
      return;
    }

    /*
     * Este componente tampoco elimina
     * directamente.
     *
     * Solo comunica la intención.
     */
    this.eliminar.emit(id);
  }

  trackByEmpleadoId(
    _index: number,
    empleado: Empleado
  ): string {

    return empleado.id ?? '';
  }
}
