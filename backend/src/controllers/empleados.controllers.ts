import type { Request, Response } from 'express';

import Empleado from '../models/empleado';

const empleadoController = {
    getEmpleado: async (_req: Request, res: Response) => {
        const empleados = await Empleado.find();

        res.json(empleados);
    },

    addEmpleado: async (req: Request, res: Response) => {
        const empleado = new Empleado(req.body);

        await empleado.save();

        res.json({
            status: 'Empleado guardado'
        });
    },

    updateEmpleado: async (req: Request, res: Response) => {
        const { id } = req.params;

        await Empleado.findByIdAndUpdate(id, req.body);

        res.json({
            status: 'Empleado actualizado'
        });
    },

    deleteEmpleado: async (req: Request, res: Response) => {
        const { id } = req.params;

        await Empleado.findByIdAndDelete(id);

        res.json({
            status: 'Empleado eliminado'
        });
    }
};

export default empleadoController;