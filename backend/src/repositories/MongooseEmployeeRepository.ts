import { Empleado } from '../domain/empleado';
import EmpleadoModel from '../models/empleado';
import { IEmployeeRepository } from './IEmployeeRepository';

export class MongooseEmployeeRepository
    implements IEmployeeRepository {

    async findAll(): Promise<Empleado[]> {
        const empleados = await EmpleadoModel.find().lean();

        return empleados.map((empleado) => ({
            id: empleado._id.toString(),
            nombre: empleado.nombre,
            cargo: empleado.cargo,
            departamento: empleado.departamento,
            sueldo: empleado.sueldo,
            createdAt: empleado.createdAt,
            updatedAt: empleado.updatedAt
        }));
    }

    async findById(id: string): Promise<Empleado | null> {
        const empleado = await EmpleadoModel
            .findById(id)
            .lean();

        if (!empleado) {
            return null;
        }

        return {
            id: empleado._id.toString(),
            nombre: empleado.nombre,
            cargo: empleado.cargo,
            departamento: empleado.departamento,
            sueldo: empleado.sueldo,
            createdAt: empleado.createdAt,
            updatedAt: empleado.updatedAt
        };
    }

    async create(empleado: Empleado): Promise<Empleado> {
        const nuevoEmpleado =
            await EmpleadoModel.create(empleado);

        return {
            id: nuevoEmpleado._id.toString(),
            nombre: nuevoEmpleado.nombre,
            cargo: nuevoEmpleado.cargo,
            departamento: nuevoEmpleado.departamento,
            sueldo: nuevoEmpleado.sueldo,
            createdAt: nuevoEmpleado.createdAt,
            updatedAt: nuevoEmpleado.updatedAt
        };
    }

    async update(
        id: string,
        empleado: Partial<Empleado>
    ): Promise<Empleado | null> {

        const actualizado =
            await EmpleadoModel.findByIdAndUpdate(
                id,
                empleado,
                {
                    new: true,
                    runValidators: true
                }
            ).lean();

        if (!actualizado) {
            return null;
        }

        return {
            id: actualizado._id.toString(),
            nombre: actualizado.nombre,
            cargo: actualizado.cargo,
            departamento: actualizado.departamento,
            sueldo: actualizado.sueldo,
            createdAt: actualizado.createdAt,
            updatedAt: actualizado.updatedAt
        };
    }

    async delete(id: string): Promise<boolean> {
        const resultado =
            await EmpleadoModel.findByIdAndDelete(id);

        return resultado !== null;
    }
}