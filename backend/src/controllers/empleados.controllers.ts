import type {
    Request,
    Response
} from 'express';

import type {
    CreateEmployeeDto,
    EmployeeIdParams,
    UpdateEmployeeDto
} from '../dtos/employee.dto';

import { AppError }
    from '../errors/AppError';

import type { IEmployeeRepository }
    from '../repositories/IEmployeeRepository';

import { sendSuccess }
    from '../shared/api-response';

type NoParams =
    Record<string, never>;

export class EmpleadosController {

    constructor(
        private readonly repository:
        IEmployeeRepository
    ) {}

    getEmpleados = async (
        _req: Request,
        res: Response
    ): Promise<void> => {

        const empleados =
            await this.repository.findAll();

        sendSuccess(
            res,
            200,
            'Empleados obtenidos correctamente',
            empleados
        );
    };

    getEmpleadoById = async (
        req: Request<EmployeeIdParams>,
        res: Response
    ): Promise<void> => {

        const { id } = req.params;

        const empleado =
            await this.repository.findById(id);

        if (!empleado) {
            throw new AppError(
                404,
                'Empleado no encontrado'
            );
        }

        sendSuccess(
            res,
            200,
            'Empleado obtenido correctamente',
            empleado
        );
    };

    addEmpleado = async (
        req: Request<
            NoParams,
            unknown,
            CreateEmployeeDto
        >,
        res: Response
    ): Promise<void> => {

        const empleado =
            await this.repository.create(
                req.body
            );

        sendSuccess(
            res,
            201,
            'Empleado creado correctamente',
            empleado
        );
    };

    updateEmpleado = async (
        req: Request<
            EmployeeIdParams,
            unknown,
            UpdateEmployeeDto
        >,
        res: Response
    ): Promise<void> => {

        const { id } = req.params;

        const empleado =
            await this.repository.update(
                id,
                req.body
            );

        if (!empleado) {
            throw new AppError(
                404,
                'Empleado no encontrado'
            );
        }

        sendSuccess(
            res,
            200,
            'Empleado actualizado correctamente',
            empleado
        );
    };

    deleteEmpleado = async (
        req: Request<EmployeeIdParams>,
        res: Response
    ): Promise<void> => {

        const { id } = req.params;

        const eliminado =
            await this.repository.delete(id);

        if (!eliminado) {
            throw new AppError(
                404,
                'Empleado no encontrado'
            );
        }

        sendSuccess(
            res,
            200,
            'Empleado eliminado correctamente'
        );
    };
}