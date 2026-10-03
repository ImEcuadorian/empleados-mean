import { z } from 'zod';

const nombreSchema = z
    .string({
        message: 'El nombre debe ser un texto'
    })
    .trim()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(100, 'El nombre no puede superar los 100 caracteres');

const cargoSchema = z
    .string({
        message: 'El cargo debe ser un texto'
    })
    .trim()
    .min(2, 'El cargo debe tener al menos 2 caracteres')
    .max(100, 'El cargo no puede superar los 100 caracteres');

const departamentoSchema = z
    .string({
        message: 'El departamento debe ser un texto'
    })
    .trim()
    .min(2, 'El departamento debe tener al menos 2 caracteres')
    .max(
        100,
        'El departamento no puede superar los 100 caracteres'
    );

const sueldoSchema = z
    .number({
        message: 'El sueldo debe ser un número'
    })
    .nonnegative('El sueldo no puede ser negativo')
    .finite('El sueldo debe ser un número válido');

export const createEmployeeSchema = z
    .object({
        nombre: nombreSchema,
        cargo: cargoSchema,
        departamento: departamentoSchema,
        sueldo: sueldoSchema
    })
    .strict();

export const updateEmployeeSchema = z
    .object({
        nombre: nombreSchema.optional(),
        cargo: cargoSchema.optional(),
        departamento: departamentoSchema.optional(),
        sueldo: sueldoSchema.optional()
    })
    .strict()
    .refine(
        (data) => Object.keys(data).length > 0,
        {
            message:
                'Debe proporcionar al menos un campo para actualizar'
        }
    );

export const employeeIdParamsSchema = z
    .object({
        id: z
            .string({
                message: 'El identificador debe ser un texto'
            })
            .trim()
            .min(1, 'El identificador es obligatorio')
            .max(100, 'El identificador no es válido')
    })
    .strict();

export type CreateEmployeeDto =
    z.infer<typeof createEmployeeSchema>;

export type UpdateEmployeeDto =
    z.infer<typeof updateEmployeeSchema>;

export type EmployeeIdParams =
    z.infer<typeof employeeIdParamsSchema>;