import type { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import type { IAuthRepository } from '../repositories/IAuthRepository';
import { AppError } from '../errors/AppError';
import { sendSuccess } from '../shared/api-response';
import { getJwtSecret, JWT_AUDIENCE, JWT_ISSUER, TOKEN_SECONDS } from '../config/auth';

// Compare even when the account does not exist, avoiding a fast failure path.
const dummyHash = bcrypt.hashSync('unused-comparison-password', 12);

export class AuthController {
 constructor(private readonly repository: IAuthRepository) {}
 login = async (req: Request, res: Response): Promise<void> => {
    const user = await this.repository.findByEmail(req.body.email);
    const valid = await bcrypt.compare(req.body.password, user?.passwordHash ?? dummyHash);
    if (!user || !valid) throw new AppError(401, 'Credenciales incorrectas');

    const token = jwt.sign({}, getJwtSecret(), {
        algorithm: 'HS256', subject: user.id,
        issuer: JWT_ISSUER, audience: JWT_AUDIENCE, expiresIn: TOKEN_SECONDS
    });
    res.setHeader('Cache-Control', 'no-store');
    sendSuccess(res, 200, 'Sesión iniciada', {
        token, expiresIn: TOKEN_SECONDS,
        usuario: { id: user.id, nombre: user.nombre, email: user.email }
    });
 };
}
