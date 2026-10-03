import type {
    Request,
    Response
} from 'express';

import { IEmployeeRepository }
    from '../repositories/IEmployeeRepository';

export class EmpleadosController {

    constructor(
        private readonly repository: IEmployeeRepository
    ) {}

    getEmpleados = async (
        _req: Request,
        res: Response
    ): Promise<void> => {

        const empleados =
            await this.repository.findAll();

        res.json(empleados);
    };

    getEmpleadoById = async (
        req: Request<{ id: string }>,
        res: Response
    ): Promise<void> => {

        const { id } = req.params;

        const empleado =
            await this.repository.findById(id);

        if (!empleado) {
            res.status(404).json({
                message: 'Empleado no encontrado'
            });

            return;
        }

        res.json(empleado);
    };

    addEmpleado = async (
        req: Request,
        res: Response
    ): Promise<void> => {

        const empleado =
            await this.repository.create(req.body);

        res.status(201).json(empleado);
    };

    updateEmpleado = async (
        req: Request<{ id: string }>,
        res: Response
    ): Promise<void> => {

        const { id } = req.params;

        const empleado =
            await this.repository.update(
                id,
                req.body
            );

        if (!empleado) {
            res.status(404).json({
                message: 'Empleado no encontrado'
            });

            return;
        }

        res.json(empleado);
    };

    deleteEmpleado = async (
        req: Request<{ id: string }>,
        res: Response
    ): Promise<void> => {

        const { id } = req.params;

        const eliminado =
            await this.repository.delete(id);

        if (!eliminado) {
            res.status(404).json({
                message: 'Empleado no encontrado'
            });

            return;
        }

        res.json({
            message: 'Empleado eliminado correctamente'
        });
    };
}