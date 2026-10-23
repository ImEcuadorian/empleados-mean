import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import helmet from 'helmet';
import mongoose from 'mongoose';
import authRoutes from './routes/auth.routes';
import { authMiddleware } from './middlewares/auth.middleware';

import {
    errorHandler,
    notFoundHandler
} from './middlewares/error.middleware';

import empleadosRoutes
    from './routes/empleados.routes';

const app = express();
// Only the local Nginx proxy may supply the client's IP address.
app.set('trust proxy', 'loopback');

app.use(helmet());
app.use(cors({ origin: process.env.FRONTEND_ORIGIN ?? 'http://localhost:4200' }));

app.use(express.json({ limit: '16kb' }));

app.use(morgan('dev'));

app.get('/api/v1/health', (_req, res) => {
    const ready = mongoose.connection.readyState === 1;
    res.status(ready ? 200 : 503).json({ success: ready });
});

app.use('/api/v1/auth', authRoutes);

app.use(
    '/api/v1',
    authMiddleware,
    empleadosRoutes
);

app.use(notFoundHandler);

app.use(errorHandler);

export default app;
