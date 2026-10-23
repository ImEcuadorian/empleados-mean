import './config/env';
import app from './app';
import { getJwtSecret } from './config/auth';
import { connectDatabase } from './config/database';

const PORT = Number(process.env.PORT ?? 3000);

const bootstrap = async (): Promise<void> => {
    getJwtSecret();
    await connectDatabase();

    app.listen(PORT, process.env.HOST ?? '127.0.0.1', () => {
        console.log(`🚀 Servidor escuchando en http://localhost:${PORT}`);
    });
};

bootstrap().catch(() => {
    console.error('No se pudo iniciar: revisa MongoDB y JWT_SECRET en backend/.env');
    process.exitCode = 1;
});
