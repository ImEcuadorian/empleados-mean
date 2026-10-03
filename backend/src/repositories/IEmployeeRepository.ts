import { Empleado } from '../domain/empleado';

export interface IEmployeeRepository {

    findAll(): Promise<Empleado[]>;

    findById(id: string): Promise<Empleado | null>;

    create(empleado: Empleado): Promise<Empleado>;

    update(
        id: string,
        empleado: Partial<Empleado>
    ): Promise<Empleado | null>;

    delete(id: string): Promise<boolean>;
}