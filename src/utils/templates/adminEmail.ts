export interface AdminEmailData {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  direccion: string;
  mascotas: number;
  personas_extra: number;
  paquete: number;
  precio: string;
  formattedDate: string;
  formattedTime: string;
  imageUrl: string;
}

export const adminEmailTemplate = (data: AdminEmailData): string => `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700&display=swap" rel="stylesheet">
</head>
<body style="margin: 0; padding: 0; background-color: #f2edeb; font-family: 'Montserrat', Arial, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f2edeb; padding: 40px 20px;">
    <tr>
      <td align="center">
        <!-- Container Principal -->
        <table width="650" cellpadding="0" cellspacing="0" border="0" style="background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(15, 51, 22, 0.15);">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #641013 0%, #853835 100%); padding: 40px; text-align: center;">
              <h1 style="margin: 0; color: #f2edeb; font-size: 28px; font-weight: 700; letter-spacing: 0.5px;">
                📌 Nueva Reserva Confirmada
              </h1>
              <p style="margin: 10px 0 0 0; color: #f2edeb; font-size: 14px; opacity: 0.9;">
                ${data.formattedDate} • ${data.formattedTime}
              </p>
            </td>
          </tr>

          <!-- Información del Cliente -->
          <tr>
            <td style="padding: 35px 40px;">
              <h2 style="margin: 0 0 20px 0; color: #0f3316; font-size: 20px; font-weight: 700; border-bottom: 2px solid #f2edeb; padding-bottom: 10px;">
                👤 Información del Cliente
              </h2>
              
              <table width="100%" cellpadding="8" cellspacing="0" border="0">
                <tr>
                  <td width="40%" style="color: #455447; font-size: 14px; font-weight: 600;">Nombre:</td>
                  <td style="color: #0f3316; font-size: 15px; font-weight: 700;">${data.first_name} ${data.last_name}</td>
                </tr>
                <tr>
                  <td style="color: #455447; font-size: 14px; font-weight: 600;">Email:</td>
                  <td style="color: #0f3316; font-size: 15px;">${data.email}</td>
                </tr>
                <tr>
                  <td style="color: #455447; font-size: 14px; font-weight: 600;">Teléfono:</td>
                  <td style="color: #0f3316; font-size: 15px;">${data.phone}</td>
                </tr>
                <tr>
                  <td style="color: #455447; font-size: 14px; font-weight: 600;">Dirección:</td>
                  <td style="color: #0f3316; font-size: 15px;">${data.direccion}</td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Detalles de la Reserva -->
          <tr>
            <td style="padding: 0 40px 35px 40px;">
              <h2 style="margin: 0 0 20px 0; color: #0f3316; font-size: 20px; font-weight: 700; border-bottom: 2px solid #f2edeb; padding-bottom: 10px;">
                📋 Detalles de la Sesión
              </h2>
              
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f2edeb; border-radius: 8px;">
                <tr>
                  <td style="padding: 20px;">
                    <table width="100%" cellpadding="8" cellspacing="0" border="0">
                      <tr>
                        <td width="50%" style="color: #455447; font-size: 14px; font-weight: 600;">Paquete:</td>
                        <td style="color: #641013; font-size: 16px; font-weight: 700;">Paquete ${data.paquete} - ${data.precio}</td>
                      </tr>
                      <tr>
                        <td style="color: #455447; font-size: 14px; font-weight: 600;">Mascotas:</td>
                        <td style="color: #0f3316; font-size: 15px; font-weight: 600;">${data.mascotas}</td>
                      </tr>
                      <tr>
                        <td style="color: #455447; font-size: 14px; font-weight: 600;">Personas extra:</td>
                        <td style="color: #0f3316; font-size: 15px; font-weight: 600;">${data.personas_extra}</td>
                      </tr>
                      <tr>
                        <td style="color: #455447; font-size: 14px; font-weight: 600;">Fecha:</td>
                        <td style="color: #0f3316; font-size: 15px; font-weight: 600;">${data.formattedDate}</td>
                      </tr>
                      <tr>
                        <td style="color: #455447; font-size: 14px; font-weight: 600;">Hora:</td>
                        <td style="color: #0f3316; font-size: 15px; font-weight: 600;">${data.formattedTime}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Comprobante de Pago -->
          <tr>
            <td style="padding: 0 40px 40px 40px;">
              <h2 style="margin: 0 0 15px 0; color: #0f3316; font-size: 20px; font-weight: 700; border-bottom: 2px solid #f2edeb; padding-bottom: 10px;">
                💳 Comprobante de Pago
              </h2>
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td align="center" style="padding: 15px 0;">
                    <img src="${data.imageUrl}" alt="Comprobante de pago" style="max-width: 100%; height: auto; border-radius: 12px; border: 3px solid #f2edeb; box-shadow: 0 2px 10px rgba(0,0,0,0.1);" />
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #0f3316; padding: 25px 40px; text-align: center;">
              <p style="margin: 0; color: #f2edeb; font-size: 13px; opacity: 0.9;">
                Notificación automática del sistema de reservas
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;