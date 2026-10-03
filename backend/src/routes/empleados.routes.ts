import { Router } from 'express';

import { EmpleadosController }
    from '../controllers/empleados.controllers';

import { MongooseEmployeeRepository }
    from '../repositories/MongooseEmployeeRepository';

const router = Router();

const empleadoRepository =
    new MongooseEmployeeRepository();

const empleadoController =
    new EmpleadosController(
        empleadoRepository
    );

router.get(
    '/empleados',
    empleadoController.getEmpleados
);

router.get(
    '/empleados/:id',
    empleadoController.getEmpleadoById
);

router.post(
    '/empleados',
    empleadoController.addEmpleado
);

router.put(
    '/empleados/:id',
    empleadoController.updateEmpleado
);

router.delete(
    '/empleados/:id',
    empleadoController.deleteEmpleado
);

export default router;