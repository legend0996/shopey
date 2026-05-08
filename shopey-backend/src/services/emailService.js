const sendEmail = require('../utils/sendEmail');
const {
  welcomeEmailTemplate,
  orderConfirmationTemplate,
  passwordResetTemplate,
  adminNotificationTemplate,
  verificationCodeTemplate,
} = require('../templates/emails');

async function sendSafeEmail(payload) {
  try {
    await sendEmail(payload);
    return true;
  } catch (err) {
    console.error('[email] send failed:', err.message);
    return false;
  }
}

async function sendBasicEmail(to, subject, text, attachments = []) {
  return sendSafeEmail({
    to,
    subject,
    text,
    html: `<p>${text}</p>`,
    attachments,
  });
}

async function sendWelcomeEmail(to) {
  return sendSafeEmail({
    to,
    subject: 'Welcome to Shopey',
    html: welcomeEmailTemplate({ email: to }),
    text: 'Welcome to Shopey. Your account is ready.',
  });
}

async function sendVerificationCodeEmail(to, code) {
  return sendSafeEmail({
    to,
    subject: 'Verify your account',
    html: verificationCodeTemplate({ code }),
    text: `Your verification code is ${code}`,
  });
}

async function sendPasswordResetEmail(to, code) {
  return sendSafeEmail({
    to,
    subject: 'Reset Password Code',
    html: passwordResetTemplate({ code }),
    text: `Your password reset code is ${code}`,
  });
}

async function sendOrderConfirmationEmail(to, order) {
  return sendSafeEmail({
    to,
    subject: 'Order Confirmation',
    html: orderConfirmationTemplate({
      orderCode: order.order_code,
      finalAmount: order.final_amount || order.total_amount,
    }),
    text: `Order ${order.order_code} confirmed.`,
  });
}

async function sendAdminNotification(to, title, message) {
  return sendSafeEmail({
    to,
    subject: title,
    html: adminNotificationTemplate({ title, message }),
    text: message,
  });
}

module.exports = {
  sendBasicEmail,
  sendWelcomeEmail,
  sendVerificationCodeEmail,
  sendPasswordResetEmail,
  sendOrderConfirmationEmail,
  sendAdminNotification,
};