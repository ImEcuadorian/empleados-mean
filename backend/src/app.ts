import express from 'express';
import cors from 'cors';
import morgan from 'morgan';

import empleadosRoutes from './routes/empleados.routes';

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

app.use('/api/v1', empleadosRoutes);

export default app;