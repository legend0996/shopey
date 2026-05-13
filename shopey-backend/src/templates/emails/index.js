function shellTemplate(title, preheader, body) {
  return `
  <div style="font-family: Inter, Arial, sans-serif; background:#f8fafc; padding:24px; color:#0f172a;">
    <div style="max-width:640px; margin:0 auto; background:#ffffff; border:1px solid #e5e7eb; border-radius:16px; overflow:hidden;">
      <div style="padding:16px 20px; background:#C9A14A; color:#ffffff; font-weight:700; font-size:18px;">Shopey</div>
      <div style="padding:20px;">
        <p style="margin:0 0 8px; color:#64748b; font-size:13px;">${preheader}</p>
        <h1 style="margin:0 0 12px; font-size:22px; line-height:1.3; color:#0f172a;">${title}</h1>
        ${body}
      </div>
    </div>
  </div>`;
}

function welcomeEmailTemplate({ email }) {
  return shellTemplate(
    'Welcome to Shopey',
    'Your account is ready for shopping.',
    `<p style="margin:0; font-size:15px; line-height:1.6; color:#334155;">Hi ${email}, your Shopey account has been created successfully. Start exploring premium products and track your orders in one place.</p>`
  );
}

function orderConfirmationTemplate({ orderCode, finalAmount }) {
  return shellTemplate(
    'Order Confirmed',
    'Your order has been received and is being processed.',
    `<p style="margin:0 0 10px; font-size:15px; line-height:1.6; color:#334155;">Thanks for shopping with Shopey. Your order is now confirmed.</p>
     <div style="background:#f8fafc; border:1px solid #e5e7eb; border-radius:12px; padding:12px;">
       <p style="margin:0; font-size:14px;"><strong>Order:</strong> ${orderCode}</p>
       <p style="margin:6px 0 0; font-size:14px;"><strong>Total:</strong> KES ${Number(finalAmount || 0).toLocaleString()}</p>
     </div>`
  );
}

function passwordResetTemplate({ code, email }) {
  const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  const resetLink = `${baseUrl}/login/reset-password?email=${encodeURIComponent(email)}&code=${encodeURIComponent(code)}`;
  return shellTemplate(
    'Reset Your Password',
    'Use the verification code below to reset your password.',
    `<p style="margin:0 0 12px; font-size:15px; line-height:1.6; color:#334155;">Use this code to reset your password. It expires in 30 minutes.</p>
     <div style="display:inline-block; background:#0f172a; color:#ffffff; border-radius:10px; padding:10px 14px; font-size:20px; letter-spacing:4px; font-weight:700;">${code}</div>
     <p style="margin:18px 0 0; font-size:15px; color:#334155;">Or click the link below to reset directly:</p>
     <a href="${resetLink}" style="display:inline-block; margin-top:10px; background:#C9A14A; color:#fff; text-decoration:none; padding:10px 18px; border-radius:8px; font-weight:600; font-size:16px;">Reset Password</a>`
  );
}

function adminNotificationTemplate({ title, message }) {
  return shellTemplate(
    title || 'Admin Notification',
    'A system event requires your attention.',
    `<p style="margin:0; font-size:15px; line-height:1.6; color:#334155;">${message}</p>`
  );
}

function verificationCodeTemplate({ code }) {
  return shellTemplate(
    'Verify Your Account',
    'Your one-time verification code is below.',
    `<p style="margin:0 0 12px; font-size:15px; line-height:1.6; color:#334155;">Enter this code to verify your account. It expires in 30 minutes.</p>
     <div style="display:inline-block; background:#0f172a; color:#ffffff; border-radius:10px; padding:10px 14px; font-size:20px; letter-spacing:4px; font-weight:700;">${code}</div>`
  );
}

module.exports = {
  welcomeEmailTemplate,
  orderConfirmationTemplate,
  passwordResetTemplate,
  adminNotificationTemplate,
  verificationCodeTemplate,
};
