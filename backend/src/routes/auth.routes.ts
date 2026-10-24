import { Router } from 'express';
import { rateLimit } from 'express-rate-limit';
import { AuthController } from '../controllers/auth.controllers';
import { MongooseAuthRepository } from '../repositories/MongooseAuthRepository';
import { loginSchema } from '../dtos/auth.dto';
import { validateRequest } from '../middlewares/validation.middleware';
import { authMiddleware } from '../middlewares/auth.middleware';
import { sendError, sendSuccess } from '../shared/api-response';

const router = Router();
const controller = new AuthController(new MongooseAuthRepository());
router.post('/login', rateLimit({
    windowMs: 15 * 60 * 1000, limit: 10,
    standardHeaders: 'draft-7', legacyHeaders: false,
    skipSuccessfulRequests: true,
    handler: (_req, res) => { sendError(res, 429, 'Demasiados intentos. Intenta en 15 minutos'); }
}), validateRequest({ body: loginSchema }), controller.login);
router.get('/me', authMiddleware, (_req, res) => {
    sendSuccess(res, 200, 'Usuario autenticado', res.locals.usuario);
});
export default router;
