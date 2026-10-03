import { Router } from 'express';
import empleadoController from '../controllers/empleados.controllers';

const router = Router();

router.get('/empleados', empleadoController.getEmpleado);
router.post('/empleados', empleadoController.addEmpleado);

router.put('/empleados/:id', empleadoController.updateEmpleado);
router.delete('/empleados/:id', empleadoController.deleteEmpleado);

export default router;