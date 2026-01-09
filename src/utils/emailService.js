import nodemailer from 'nodemailer';

let transporter;

if (process.env.NODE_ENV === 'production') {
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: true,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });
} else {
  transporter = {
    sendMail: async (mailOptions) => {
      console.log('[MOCK EMAIL]', mailOptions);
      return { messageId: 'mock-id' };
    }
  };
}

export async function sendEmail(to, subject, html) {
  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM || 'noreply@auth-api.com',
      to,
      subject,
      html
    });
  } catch (error) {
    console.error('Email error:', error);
    throw error;
  }
}