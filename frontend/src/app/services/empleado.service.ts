import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import {
  BehaviorSubject,
  map,
  Observable,
  tap
} from 'rxjs';

import {
  ActualizarEmpleado,
  Empleado,
  NuevoEmpleado
} from '../models/empleado';

import { ApiResponse } from '../models/api-response';

@Injectable({
  providedIn: 'root'
})
export class EmpleadoService {

  private readonly URL_API =
    'http://localhost:3000/api/v1/empleados';

  private readonly empleadosSubject =
    new BehaviorSubject<readonly Empleado[]>([]);

  readonly empleados$: Observable<readonly Empleado[]> =
    this.empleadosSubject.asObservable();

  constructor(
    private readonly http: HttpClient
  ) {}

  cargarEmpleados():
    Observable<readonly Empleado[]> {

    return this.http
      .get<ApiResponse<Empleado[]>>(
        this.URL_API
      )
      .pipe(
        map((response) =>
          response.data ?? []
        ),

        tap((empleados) => {
          this.empleadosSubject.next(
            [...empleados]
          );
        })
      );
  }

  obtenerEmpleadoPorId(
    id: string
  ): Observable<Empleado> {

    return this.http
      .get<ApiResponse<Empleado>>(
        `${this.URL_API}/${id}`
      )
      .pipe(
        map((response) =>
          this.obtenerData(response)
        )
      );
  }

  crearEmpleado(
    empleado: NuevoEmpleado
  ): Observable<Empleado> {

    return this.http
      .post<ApiResponse<Empleado>>(
        this.URL_API,
        empleado
      )
      .pipe(
        map((response) =>
          this.obtenerData(response)
        ),

        tap((nuevoEmpleado) => {

          const current =
            this.empleadosSubject.value;

          this.empleadosSubject.next([
            ...current,
            nuevoEmpleado
          ]);
        })
      );
  }

  actualizarEmpleado(
    id: string,
    cambios: ActualizarEmpleado
  ): Observable<Empleado> {

    return this.http
      .put<ApiResponse<Empleado>>(
        `${this.URL_API}/${id}`,
        cambios
      )
      .pipe(
        map((response) =>
          this.obtenerData(response)
        ),

        tap((empleadoActualizado) => {

          const current =
            this.empleadosSubject.value;

          const nuevoEstado =
            current.map((empleado) =>
              empleado.id === id
                ? empleadoActualizado
                : empleado
            );

          this.empleadosSubject.next(
            nuevoEstado
          );
        })
      );
  }

  eliminarEmpleado(
    id: string
  ): Observable<void> {

    return this.http
      .delete<ApiResponse<void>>(
        `${this.URL_API}/${id}`
      )
      .pipe(
        tap(() => {

          const current =
            this.empleadosSubject.value;

          const nuevoEstado =
            current.filter(
              (empleado) =>
                empleado.id !== id
            );

          this.empleadosSubject.next(
            nuevoEstado
          );
        }),

        map(() => undefined)
      );
  }

  private obtenerData<T>(
    response: ApiResponse<T>
  ): T {

    if (response.data === undefined) {
      throw new Error(
        'La API no devolvió los datos esperados'
      );
    }

    return response.data;
  }
}
