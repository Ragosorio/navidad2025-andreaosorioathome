export interface ClientEmailData {
  first_name: string;
  last_name: string;
  formattedDate: string;
  formattedTime: string;
}

export const clientEmailTemplate = (data: ClientEmailData): string => `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />

  <!-- Evitar que Gmail/Facebook Email destruyan los colores -->
  <meta name="color-scheme" content="light dark">
  <meta name="supported-color-schemes" content="light dark">

  <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700&display=swap" rel="stylesheet">

  <style>
    /* MODO OSCURO CONTROLADO */
    @media (prefers-color-scheme: dark) {
      body, table, td {
        background-color: #121212 !important;
        color: #f2edeb !important;
      }

      /* Fondo del contenedor */
      .email-container {
        background-color: #1b1b1b !important;
        box-shadow: 0 4px 20px rgba(255, 255, 255, 0.05) !important;
      }

      /* Texto principal */
      .text {
        color: #e6e0de !important;
      }

      /* Header debe mantener tu gradiente y NO invertirse */
      .header {
        background: linear-gradient(135deg, #0f3316 0%, #455447 100%) !important;
        color: #f2edeb !important;
      }

      /* Tarjeta de detalles */
      .details-card {
        background-color: #262626 !important;
        border-left-color: #8a2030 !important;
      }

      /* Footer igual que header */
      .footer {
        background-color: #0f3316 !important;
        color: #f2edeb !important;
      }
    }
  </style>
</head>

<body style="margin: 0; padding: 0; background-color: #f2edeb; font-family: 'Montserrat', Arial, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="padding: 40px 20px;">
    <tr>
      <td align="center">

        <table width="600" cellpadding="0" cellspacing="0" border="0" class="email-container" style="background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(15, 51, 22, 0.1);">

          <!-- HEADER -->
          <tr>
            <td class="header" style="background: linear-gradient(135deg, #0f3316 0%, #455447 100%); padding: 50px 40px; text-align: center;">
              <h1 style="margin: 0; color: #f2edeb; font-size: 32px; font-weight: 700; letter-spacing: 1px;">
                ¡Tu cita ha sido agendada! 🎄
              </h1>
            </td>
          </tr>

          <!-- CONTENIDO -->
          <tr>
            <td style="padding: 40px;">
              <p class="text" style="margin: 0 0 20px 0; color: #455447; font-size: 16px; line-height: 1.6;">
                Hola <strong style="color: #0f3316;">${data.first_name} ${data.last_name}</strong>,
              </p>

              <p class="text" style="margin: 0 0 30px 0; color: #455447; font-size: 16px; line-height: 1.6;">
                ¡Tu cita ha sido <strong style="color: #641013;">confirmada exitosamente</strong>!
                Estamos emocionados de capturar tus momentos especiales esta Navidad.
              </p>

              <!-- TARJETA DETALLES -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0" class="details-card" style="background-color: #f2edeb; border-radius: 12px; border-left: 4px solid #641013;">
                <tr>
                  <td style="padding: 25px;">
                    <p style="margin: 0 0 12px 0; color: #0f3316; font-size: 14px; font-weight: 600; text-transform: uppercase;">
                      📅 Detalles de tu sesión
                    </p>

                    <p style="margin: 0 0 8px 0; color: #455447; font-size: 15px;">
                      <strong style="color: #0f3316;">Fecha:</strong> ${data.formattedDate}
                    </p>

                    <p style="margin: 0; color: #455447; font-size: 15px;">
                      <strong style="color: #0f3316;">Hora:</strong> ${data.formattedTime}
                    </p>
                  </td>
                </tr>
              </table>

              <p class="text" style="margin: 30px 0 0 0; color: #455447; font-size: 15px; line-height: 1.6;">
                Si tienes alguna duda, contáctanos por WhatsApp.
              </p>
            </td>
          </tr>

          <!-- FOOTER -->
          <tr>
            <td class="footer" style="background-color: #0f3316; padding: 30px 40px; text-align: center;">
              <p style="margin: 0 0 10px 0; color: #f2edeb; font-size: 16px; font-weight: 600;">
                Gracias por confiarnos tu navidad este 2025 ✨
              </p>
              <p style="margin: 0; color: #f2edeb; font-size: 13px; opacity: 0.8;">
                Andrea Osorio Photography
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
