import express from 'express';
import cors from 'cors';
import morgan from 'morgan';

import {
    errorHandler,
    notFoundHandler
} from './middlewares/error.middleware';

import empleadosRoutes
    from './routes/empleados.routes';

const app = express();

app.use(cors());

app.use(express.json());

app.use(morgan('dev'));

app.use(
    '/api/v1',
    empleadosRoutes
);

app.use(notFoundHandler);

app.use(errorHandler);

export default app;