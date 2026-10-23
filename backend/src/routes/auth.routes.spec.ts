import request from 'supertest';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import app from '../app';
import { Usuario } from '../models/usuario';
import { MongooseEmployeeRepository } from '../repositories/MongooseEmployeeRepository';
import { JWT_AUDIENCE, JWT_ISSUER } from '../config/auth';

const secret = 'test-secret-only-32-bytes-minimum-value';
const user = { id: '507f1f77bcf86cd799439011', nombre: 'Prueba', email: 'prueba@example.com',
    passwordHash: bcrypt.hashSync('Test-password-123', 12) };
const findOne = jest.spyOn(Usuario, 'findOne');
const findById = jest.spyOn(Usuario, 'findById');
const employees = jest.spyOn(MongooseEmployeeRepository.prototype, 'findAll');

function token(options: jwt.SignOptions = {}, signingSecret = secret): string {
    return jwt.sign({}, signingSecret, { algorithm: 'HS256', subject: user.id,
        issuer: JWT_ISSUER, audience: JWT_AUDIENCE, expiresIn: 900, ...options });
}

beforeEach(() => {
    process.env.JWT_SECRET = secret;
    findOne.mockReturnValue({ select: jest.fn().mockResolvedValue(user) } as never);
    findById.mockResolvedValue(user as never);
    employees.mockResolvedValue([]);
});

afterAll(() => jest.restoreAllMocks());

describe('Autenticación HTTP con firma JWT real', () => {
    it('inicia sesión, normaliza correo y no expone el hash', async () => {
        const response = await request(app).post('/api/v1/auth/login')
            .send({ email: ' PRUEBA@EXAMPLE.COM ', password: 'Test-password-123' }).expect(200);
        expect(findOne).toHaveBeenCalledWith({ email: user.email });
        expect(response.body.data.usuario).toEqual({ id: user.id, nombre: user.nombre, email: user.email });
        expect(JSON.stringify(response.body)).not.toContain('passwordHash');
        expect(response.headers['cache-control']).toBe('no-store');
        const payload = jwt.verify(response.body.data.token, secret,
            { algorithms: ['HS256'], issuer: JWT_ISSUER, audience: JWT_AUDIENCE }) as jwt.JwtPayload;
        expect(payload.sub).toBe(user.id);
        expect(payload.exp! - payload.iat!).toBe(900);
        await request(app).get('/api/v1/empleados')
            .set('Authorization', `Bearer ${response.body.data.token}`).expect(200);
    });

    it('rechaza una contraseña incorrecta y una cuenta inexistente con el mismo mensaje', async () => {
        const wrong = await request(app).post('/api/v1/auth/login')
            .send({ email: user.email, password: 'wrong' }).expect(401);
        findOne.mockReturnValue({ select: jest.fn().mockResolvedValue(null) } as never);
        const missing = await request(app).post('/api/v1/auth/login')
            .send({ email: 'missing@example.com', password: 'wrong' }).expect(401);
        expect(wrong.body).toEqual(missing.body);
    });

    it('valida datos y rechaza objetos de consulta como correo', async () => {
        await request(app).post('/api/v1/auth/login')
            .send({ email: { $ne: null }, password: 'test' }).expect(400);
        expect(findOne).not.toHaveBeenCalled();
    });

    it.each(['get', 'post', 'put', 'delete'] as const)('protege %s de empleados sin JWT', async method => {
        const path = method === 'put' || method === 'delete' ? '/api/v1/empleados/123' : '/api/v1/empleados';
        await request(app)[method](path).expect(401);
        expect(employees).not.toHaveBeenCalled();
    });

    it.each([
        ['expirado', () => token({ expiresIn: -1 })],
        ['firma inválida', () => token({}, 'another-secret-value-with-32-bytes')],
        ['audiencia incorrecta', () => token({ audience: 'another-app' })],
        ['algoritmo incorrecto', () => token({ algorithm: 'HS384' })],
        ['mal formado', () => 'invalid.token']
    ])('rechaza JWT %s', async (_name, makeToken) => {
        await request(app).get('/api/v1/empleados')
            .set('Authorization', `Bearer ${makeToken()}`).expect(401);
        expect(findById).not.toHaveBeenCalled();
    });

    it('rechaza usuarios eliminados aunque la firma sea válida', async () => {
        findById.mockResolvedValue(null);
        await request(app).get('/api/v1/auth/me')
            .set('Authorization', `Bearer ${token()}`).expect(401);
    });

    it('devuelve el usuario autenticado', async () => {
        const response = await request(app).get('/api/v1/auth/me')
            .set('Authorization', `Bearer ${token()}`).expect(200);
        expect(response.body.data.email).toBe(user.email);
    });

    it('limita intentos fallidos de login', async () => {
        findOne.mockReturnValue({ select: jest.fn().mockResolvedValue(null) } as never);
        let status = 0;
        for (let i = 0; i < 11 && status !== 429; i++) {
            const response = await request(app).post('/api/v1/auth/login')
                .send({ email: user.email, password: 'wrong' });
            status = response.status;
        }
        expect(status).toBe(429);
    }, 15000);
});
