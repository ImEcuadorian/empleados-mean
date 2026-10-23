import '../config/env';
import { createInterface } from 'node:readline/promises';
import { stdin, stdout } from 'node:process';
import { Writable } from 'node:stream';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { connectDatabase } from '../config/database';
import { createUserSchema } from '../dtos/auth.dto';
import { Usuario } from '../models/usuario';

async function main(): Promise<void> {
    let hidden = false;
    const output = new Writable({
        write(chunk, _encoding, callback) {
            if (!hidden) stdout.write(chunk);
            callback();
        }
    });
    const prompt = createInterface({ input: stdin, output, terminal: Boolean(stdin.isTTY) });
    let data;
    try {
        const nombre = await prompt.question('Nombre: ');
        const email = await prompt.question('Correo: ');
        stdout.write('Contraseña (mínimo 12 caracteres, entrada oculta): ');
        hidden = true;
        const password = await prompt.question('');
        hidden = false;
        stdout.write('\n');
        data = createUserSchema.parse({ nombre, email, password });
    } finally { prompt.close(); }
    await connectDatabase();
    await Usuario.init();
    const passwordHash = await bcrypt.hash(data.password, 12);
    await Usuario.create({ nombre: data.nombre, email: data.email, passwordHash });
    console.log('Usuario creado. Ya puedes iniciar sesión.');
}

main().catch(error => {
    console.error(error?.code === 11000 ? 'El correo ya está registrado' :
        error?.name === 'ZodError' ? 'Datos inválidos: revisa el correo y la longitud de la contraseña' :
        'No se pudo crear el usuario. Revisa la conexión a MongoDB.');
    process.exitCode = 1;
}).finally(() => mongoose.disconnect());
