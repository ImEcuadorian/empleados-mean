import { z } from 'zod';

export const loginSchema = z.object({
    email: z.string().trim().toLowerCase().email().max(254),
    password: z.string().min(1).refine(value => Buffer.byteLength(value) <= 72,
        'La contraseña no puede superar los 72 bytes')
}).strict();

export const createUserSchema = loginSchema.extend({
    nombre: z.string().trim().min(2).max(100),
    password: z.string().min(12, 'Usa al menos 12 caracteres')
        .refine(value => Buffer.byteLength(value) <= 72,
            'La contraseña no puede superar los 72 bytes')
});
