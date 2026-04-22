import { NextResponse } from 'next/server';
import mssql from 'mssql';
import { dbConfig } from '@/lib/db-mssql';
import { Verificar2FARequest, Verificar2FAResponse, generarToken } from '@/lib/types';

export async function POST(request: Request) {
  try {
    const body: Verificar2FARequest = await request.json();
    const { email, codigo } = body;

    if (!email || !codigo) {
      return NextResponse.json<Verificar2FAResponse>({
        mensaje: 'Email y código son requeridos',
        valido: false,
      }, { status: 400 });
    }

    if (codigo.length !== 6) {
      return NextResponse.json<Verificar2FAResponse>({
        mensaje: 'El código debe tener 6 dígitos',
        valido: false,
      }, { status: 400 });
    }

    const pool = await mssql.connect({
      server: dbConfig.host,
      database: dbConfig.database,
      user: dbConfig.user,
      password: dbConfig.password,
      port: dbConfig.port,
      options: {
        encrypt: false,
        trustServerCertificate: true,
      },
    });

    const result = await pool.request()
      .input('email', mssql.VarChar, email)
      .query('SELECT * FROM Usuario_trabajador WHERE Correo = @email');

    if (result.recordset.length === 0) {
      await pool.close();
      return NextResponse.json<Verificar2FAResponse>({
        mensaje: 'Usuario no encontrado',
        valido: false,
      }, { status: 404 });
    }

    const usuario = result.recordset[0];

    if (!usuario.Codigo2fa) {
      await pool.close();
      return NextResponse.json<Verificar2FAResponse>({
        mensaje: 'No hay código 2FA pendiente',
        valido: false,
      }, { status: 400 });
    }

    const expiracion = new Date(usuario.Expiracion);
    if (expiracion < new Date()) {
      await pool.request()
        .input('id', mssql.Int, usuario.IdUsuario)
        .query('UPDATE Usuario_trabajador SET Codigo2fa = NULL, Expiracion = NULL, SegundoFactorPendiente = 0 WHERE IdUsuario = @id');
      
      await pool.close();
      return NextResponse.json<Verificar2FAResponse>({
        mensaje: 'El código ha expirado',
        valido: false,
      }, { status: 400 });
    }

    if (usuario.Codigo2fa !== codigo) {
      await pool.close();
      return NextResponse.json<Verificar2FAResponse>({
        mensaje: 'Código incorrecto',
        valido: false,
      }, { status: 401 });
    }

    await pool.request()
      .input('id', mssql.Int, usuario.IdUsuario)
      .query('UPDATE Usuario_trabajador SET Codigo2fa = NULL, Expiracion = NULL, SegundoFactorPendiente = 0 WHERE IdUsuario = @id');

    await pool.close();

    const token = generarToken();

    return NextResponse.json<Verificar2FAResponse>({
      mensaje: 'Autenticación exitosa',
      valido: true,
      token,
    }, { status: 200 });

  } catch (error) {
    console.error('2FA verification error:', error);
    return NextResponse.json<Verificar2FAResponse>({
      mensaje: 'Error interno del servidor',
      valido: false,
    }, { status: 500 });
  }
}