export interface AuthUser {
    id: string;
    nombre: string;
    email: string;
    passwordHash: string;
}

export interface IAuthRepository {
    findByEmail(email: string): Promise<AuthUser | null>;
}
