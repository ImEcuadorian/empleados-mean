import app from './app';
import { connectDatabase } from './config/database';

const PORT = Number(process.env.PORT ?? 3000);

const bootstrap = async (): Promise<void> => {
    await connectDatabase();

    app.listen(PORT, () => {
        console.log(`🚀 Servidor escuchando en http://localhost:${PORT}`);
    });
};

bootstrap();