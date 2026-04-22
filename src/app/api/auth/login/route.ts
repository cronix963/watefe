import { NextResponse } from 'next/server';
import mssql from 'mssql';
import { dbConfig } from '@/lib/db-mssql';
import { emailConfig, sendEmail, generateEmailHtml } from '@/lib/email';
import { generarCodigo2FA, LoginRequest, LoginResponse } from '@/lib/types';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    const body: LoginRequest = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json<LoginResponse>({
        mensaje: 'Email y contraseña son requeridos',
        estado: 'error',
        exito: false,
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
      return NextResponse.json<LoginResponse>({
        mensaje: 'Credenciales incorrectas',
        estado: 'error',
        exito: false,
      }, { status: 401 });
    }

    const usuario = result.recordset[0];
    const passwordValida = await bcrypt.compare(password, usuario.ContrasenaHash);

    if (!passwordValida) {
      await pool.close();
      return NextResponse.json<LoginResponse>({
        mensaje: 'Credenciales incorrectas',
        estado: 'error',
        exito: false,
      }, { status: 401 });
    }

    const codigo2FA = generarCodigo2FA();
    const expiracion = new Date(Date.now() + 5 * 60 * 1000);

    await pool.request()
      .input('codigo', mssql.VarChar, codigo2FA)
      .input('expiracion', mssql.DateTime, expiracion)
      .input('id', mssql.Int, usuario.IdUsuario)
      .query('UPDATE Usuario_trabajador SET Codigo2fa = @codigo, Expiracion = @expiracion, SegundoFactorPendiente = 1 WHERE IdUsuario = @id');

    await pool.close();

    const htmlCorreo = generateEmailHtml(codigo2FA, usuario.NombreUsuario);
    const correoEnviado = await sendEmail(email, 'Código de Verificación - Sistema SASL', htmlCorreo);

    if (!correoEnviado) {
      console.error('Failed to send email');
    }

    return NextResponse.json<LoginResponse>({
      mensaje: 'Código de verificación enviado. Por favor, verifica tu correo electrónico.',
      estado: 'pendiente',
      exito: true,
    }, { status: 200 });

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json<LoginResponse>({
      mensaje: 'Error interno del servidor',
      estado: 'error',
      exito: false,
    }, { status: 500 });
  }
}