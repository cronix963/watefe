export interface EmailConfig {
  host: string;
  port: number;
  user: string;
  password: string;
  enableSsl: boolean;
}

export const emailConfig: EmailConfig = {
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  user: process.env.SMTP_USER || 'dinerus3452@gmail.com',
  password: process.env.SMTP_PASSWORD || 'adft tmlt rdks ooyk',
  enableSsl: process.env.SMTP_ENABLE_SSL === 'true',
};

export async function sendEmail(
  to: string,
  subject: string,
  html: string
): Promise<boolean> {
  try {
    const nodemailer = await import('nodemailer');
    
    const transporter = nodemailer.createTransport({
      host: emailConfig.host,
      port: emailConfig.port,
      secure: emailConfig.enableSsl,
      auth: {
        user: emailConfig.user,
        pass: emailConfig.password,
      },
    });

    await transporter.sendMail({
      from: `"Sistema SASL" <${emailConfig.user}>`,
      to,
      subject,
      html,
    });

    return true;
  } catch (error) {
    console.error('Email send failed:', error);
    return false;
  }
}

export function generateEmailHtml(codigo: string, nombre: string): string {
  return `<!DOCTYPE html>
<html lang='es'>
<head>
    <meta charset='UTF-8'>
    <meta name='viewport' content='width=device-width, initial-scale=1.0'>
    <title>Código de Verificación</title>
</head>
<body style='margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f4;'>
    <table cellpadding='0' cellspacing='0' border='0' width='100%' style='background-color: #f4f4f4; padding: 20px;'>
        <tr>
            <td align='center'>
                <table cellpadding='0' cellspacing='0' border='0' width='600' style='max-width: 600px; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);'>
                    <tr>
                        <td style='background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;'>
                            <h1 style='color: #ffffff; margin: 0; font-size: 28px; font-weight: 600;'>🔐 Verificación de Seguridad</h1>
                        </td>
                    </tr>
                    <tr>
                        <td style='padding: 40px 30px;'>
                            <p style='color: #333333; font-size: 16px; line-height: 1.6; margin-bottom: 20px;'>
                                Hola <strong>${nombre}</strong>,
                            </p>
                            <p style='color: #333333; font-size: 16px; line-height: 1.6; margin-bottom: 25px;'>
                                Se ha solicitado un código de verificación para acceder a tu cuenta. Usa el siguiente código:
                            </p>
                            <table cellpadding='0' cellspacing='0' border='0' width='100%' style='margin: 30px 0;'>
                                <tr>
                                    <td align='center'>
                                        <div style='background: linear-gradient(135deg, #f5f7fa 0%, #e4e8ec 100%); padding: 25px 40px; border-radius: 12px; border: 2px dashed #667eea; display: inline-block;'>
                                            <span style='font-size: 42px; font-weight: 700; letter-spacing: 12px; color: #667eea; font-family: 'Courier New', monospace;'>${codigo}</span>
                                        </div>
                                    </td>
                                </tr>
                            </table>
                            <div style='background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px 20px; margin: 25px 0; border-radius: 0 4px 4px 0;'>
                                <p style='color: #856404; font-size: 14px; margin: 0;'>
                                    <strong>⚠️ Importante:</strong> Este código expirará en <strong>5 minutos</strong>. No compartas este código con nadie.
                                </p>
                            </div>
                            <p style='color: #666666; font-size: 14px; line-height: 1.6; margin-top: 30px;'>
                                Si no solicitaste este código, por favor ignora este correo o contacta al administrador.
                            </p>
                        </td>
                    </tr>
                    <tr>
                        <td style='background-color: #f8f9fa; padding: 20px 30px; text-align: center; border-radius: 0 0 8px 8px;'>
                            <p style='color: #999999; font-size: 12px; margin: 0;'>
                                Sistema SASL - Todos los derechos reservados
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>`;
}