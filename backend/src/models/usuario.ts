import { Schema, model } from 'mongoose';

const usuarioSchema = new Schema({
    nombre: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true, select: false }
}, { timestamps: true });

export const Usuario = model('Usuario', usuarioSchema);
