import nodemailer from 'nodemailer';

const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

const sendPasswordResetEmail = async (email, resetToken, firstName) => {
  const transporter = createTransporter();
  
  const resetURL = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
  
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: email,
    subject: 'BINAES - Restablecimiento de contraseña',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Restablecimiento de contraseña</h2>
        <p>Hola profe,</p>
        <p>Ha solicitado restablecer su contraseña para su cuenta.</p>
        <p>Por favor, haga clic en el botón de abajo para restablecer su contraseña:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetURL}" 
             style="background-color: #007bff; color: white; padding: 12px 30px; 
                    text-decoration: none; border-radius: 5px; display: inline-block;">
            Restablecer contraseña
          </a>
        </div>
        <p>Si el botón no funciona, puede copiar y pegar este enlace en su navegador:</p>
        <p style="word-break: break-all; color: #666;">${resetURL}</p>
        <p><strong>Este enlace expirará en 10 minutos.</strong></p>
        <p>Si no solicitó este restablecimiento de contraseña, por favor, ignore este correo.</p>
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
        <p style="color: #666; font-size: 12px;">
          Este es un correo electrónico automático del Sistema de Biblioteca Nacional BINAES (hecho por Santiago Ávila).
        </p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};

const sendWelcomeEmail = async (email, firstName) => {
  const transporter = createTransporter();
  
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: email,
    subject: 'Bienvenido a BINAES',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Bienvenido!</h2>
        <p>Hola ${firstName},</p>
        <p>Bienvenido a la Biblioteca Nacional BINAES. Su cuenta ha sido creada exitosamente.</p>
        <p>Ya puede acceder a nuestros servicios digitales y gestionar su cuenta.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.FRONTEND_URL}/login" 
             style="background-color: #28a745; color: white; padding: 12px 30px; 
                    text-decoration: none; border-radius: 5px; display: inline-block;">
            Acceder a su cuenta
          </a>
        </div>
        <p>Si tiene alguna pregunta, contácteme por teams 👍👍👍👍</p>
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
        <p style="color: #666; font-size: 12px;">
          Este es un correo electrónico automático del Sistema de Biblioteca Nacional BINAES (hecho por Santiago Ávila).
        </p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};

export { sendPasswordResetEmail, sendWelcomeEmail };
