export interface Empleado {
  id?: string;
  nombre: string;
  cargo: string;
  departamento: string;
  sueldo: number;
  createdAt?: string;
  updatedAt?: string;
}

export type NuevoEmpleado =
  Omit<Empleado, 'id' | 'createdAt' | 'updatedAt'>;

export type ActualizarEmpleado =
  Partial<NuevoEmpleado>;
