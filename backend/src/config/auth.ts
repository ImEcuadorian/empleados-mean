export const JWT_ISSUER = 'empleados-api';
export const JWT_AUDIENCE = 'empleados-web';
export const TOKEN_SECONDS = 15 * 60;

export function getJwtSecret(): string {
    const secret = process.env.JWT_SECRET;
    if (!secret || Buffer.byteLength(secret) < 32) {
        throw new Error('JWT_SECRET debe contener al menos 32 bytes');
    }
    return secret;
}
