const nodemailer = require('nodemailer');

let transporter;

function getTransporter() {
  if (transporter) return transporter;

  const host = process.env.SMTP_HOST || 'smtp.gmail.com';
  const port = Number(process.env.SMTP_PORT || 587);
  const secure = String(process.env.SMTP_SECURE || '').toLowerCase() === 'true' || port === 465;
  const user = process.env.SMTP_USER || process.env.EMAIL_USER;
  const pass = process.env.SMTP_PASS || process.env.EMAIL_PASS;

  if (!user || !pass) {
    return null;
  }

  transporter = nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass },
  });

  return transporter;
}

async function sendEmail({ to, subject, text, html, attachments = [] }) {
  const mailer = getTransporter();

  if (!mailer) {
    throw new Error('SMTP credentials are missing. Set SMTP_USER/SMTP_PASS (or EMAIL_USER/EMAIL_PASS).');
  }

  return mailer.sendMail({
    from: process.env.EMAIL_FROM || `"Shopey" <${process.env.SMTP_USER || process.env.EMAIL_USER}>`,
    to,
    subject,
    text,
    html,
    attachments,
  });
}

module.exports = sendEmail;
