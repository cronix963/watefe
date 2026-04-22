export interface Usuario {
  IdUsuario: number;
  Correo: string;
  ContrasenaHash: string;
  NombreUsuario: string;
  Codigo2fa: string | null;
  Expiracion: Date | null;
  SegundoFactorPendiente: boolean | null;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  mensaje: string;
  estado: string;
  exito: boolean;
}

export interface Verificar2FARequest {
  email: string;
  codigo: string;
}

export interface Verificar2FAResponse {
  mensaje: string;
  valido: boolean;
  token?: string;
}

export function generarCodigo2FA(): string {
  const random = Math.random();
  return Math.floor(100000 + random * 900000).toString();
}

export function generarToken(): string {
  const random = Math.random().toString(36).substring(2);
  const timestamp = Date.now().toString(36);
  return `${random}.${timestamp}`;
}

export function esCodigoExpirado(expiracion: Date | null): boolean {
  if (!expiracion) return true;
  return new Date(expiracion) < new Date();
}