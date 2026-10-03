import { Router } from 'express';

import { EmpleadosController }
    from '../controllers/empleados.controllers';

import {
    createEmployeeSchema,
    employeeIdParamsSchema,
    updateEmployeeSchema
} from '../dtos/employee.dto';

import { validateRequest }
    from '../middlewares/validation.middleware';

import { MongooseEmployeeRepository }
    from '../repositories/MongooseEmployeeRepository';

const router = Router();

const repository =
    new MongooseEmployeeRepository();

const controller =
    new EmpleadosController(repository);

router.get(
    '/empleados',
    controller.getEmpleados
);

router.get(
    '/empleados/:id',

    validateRequest({
        params: employeeIdParamsSchema
    }),

    controller.getEmpleadoById
);

router.post(
    '/empleados',

    validateRequest({
        body: createEmployeeSchema
    }),

    controller.addEmpleado
);

router.put(
    '/empleados/:id',

    validateRequest({
        params: employeeIdParamsSchema,
        body: updateEmployeeSchema
    }),

    controller.updateEmpleado
);

router.delete(
    '/empleados/:id',

    validateRequest({
        params: employeeIdParamsSchema
    }),

    controller.deleteEmpleado
);

export default router;