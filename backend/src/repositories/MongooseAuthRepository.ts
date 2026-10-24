import { Usuario } from '../models/usuario';
import type { AuthUser, IAuthRepository } from './IAuthRepository';

export class MongooseAuthRepository implements IAuthRepository {
    async findByEmail(email: string): Promise<AuthUser | null> {
        const user = await Usuario.findOne({ email }).select('+passwordHash');
        return user ? { id: user.id, nombre: user.nombre, email: user.email,
            passwordHash: user.passwordHash } : null;
    }
}
