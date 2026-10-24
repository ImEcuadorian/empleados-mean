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
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();
// The directory is public, but should always reflect the latest employee changes.
router.use((_req, res, next) => {
    res.setHeader('Cache-Control', 'no-store');
    next();
});

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
    authMiddleware,

    validateRequest({
        body: createEmployeeSchema
    }),

    controller.addEmpleado
);

router.put(
    '/empleados/:id',
    authMiddleware,

    validateRequest({
        params: employeeIdParamsSchema,
        body: updateEmployeeSchema
    }),

    controller.updateEmpleado
);

router.delete(
    '/empleados/:id',
    authMiddleware,

    validateRequest({
        params: employeeIdParamsSchema
    }),

    controller.deleteEmpleado
);

export default router;
