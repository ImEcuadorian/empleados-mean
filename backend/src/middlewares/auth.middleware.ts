import type { RequestHandler } from 'express';
import jwt from 'jsonwebtoken';
import { getJwtSecret, JWT_AUDIENCE, JWT_ISSUER } from '../config/auth';
import { Usuario } from '../models/usuario';
import { AppError } from '../errors/AppError';

export const authMiddleware: RequestHandler = async (req, res, next) => {
    const match = /^Bearer ([^\s]+)$/i.exec(req.headers.authorization ?? '');
    if (!match) throw new AppError(401, 'Debes iniciar sesión');

    let userId: string;
    const secret = getJwtSecret();
    try {
        const payload = jwt.verify(match[1], secret, {
            algorithms: ['HS256'], issuer: JWT_ISSUER, audience: JWT_AUDIENCE
        });
        if (typeof payload === 'string' || typeof payload.sub !== 'string' ||
            !/^[a-f\d]{24}$/i.test(payload.sub) || typeof payload.exp !== 'number') {
            throw new Error('Payload inválido');
        }
        userId = payload.sub;
    } catch {
        throw new AppError(401, 'Sesión inválida o expirada');
    }
    const user = await Usuario.findById(userId);
    if (!user) throw new AppError(401, 'Sesión inválida o expirada');
    res.locals.usuario = { id: user.id, nombre: user.nombre, email: user.email };
    res.setHeader('Cache-Control', 'no-store');
    next();
};
