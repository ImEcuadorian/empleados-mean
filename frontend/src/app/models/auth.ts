export interface Usuario {
  id: string;
  nombre: string;
  email: string;
}

export interface LoginResponse {
  token: string;
  expiresIn: number;
  usuario: Usuario;
}
