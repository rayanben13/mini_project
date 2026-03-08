import SibApiV3Sdk from 'sib-api-v3-sdk';

const BREVO_API_KEY = process.env.BREVO_API_KEY;

const defaultClient = SibApiV3Sdk.ApiClient.instance;
defaultClient.authentications['api-key'].apiKey = BREVO_API_KEY;
const tranEmailApi = new SibApiV3Sdk.TransactionalEmailsApi();

const SENDER = {
  email: process.env.EMAIL,
  name: process.env.NAME,
};

export const sendEmail = async ({ to, subject, text, html }) => {
  try {
    const sendSmtpEmail = {
      sender: SENDER,
      to: [{ email: to }],
      subject,
      htmlContent: html || `<pre>${text || ''}</pre>`,
      textContent: text || undefined,
    };

    await tranEmailApi.sendTransacEmail(sendSmtpEmail);
    console.log(`✅ Email sent to ${to}`);
  } catch (error) {
    console.error('❌ Failed to send email:', error?.response?.body || error);
    throw new Error('Email sending failed');
  }
};

export const sendVerificationEmail = async (email, code) => {
  const subject = 'Verify your email address';
  const html = `
    <div style="font-family: Arial, sans-serif; text-align: center;">
      <h2>Welcome to MyApp 🎉</h2>
      <p>Your verification code is:</p>
      <h1 style="letter-spacing: 4px;">${code}</h1>
      <p>This code will expire in <b>15 minutes</b>.</p>
    </div>
  `;

  await sendEmail({
    to: email,
    subject,
    text: `Your verification code is: ${code}`,
    html,
  });

  console.log(`📨 Verification code sent to ${email}`);
};

export const sendPasswordResetEmail = async (email, token) => {
  const subject = 'Reset your password';
  const html = `
    <div style="font-family: Arial, sans-serif; text-align: center;">
      <h2>Reset your password</h2>
      <p>Your password reset token is:</p>
      <h1 style="letter-spacing: 4px;"> ${process.env.FRONTEND_URL}/resetPassword/${token} </h1>
    
    </div>
  `;
  await sendEmail({
    to: email,
    subject,
    text: `visit this link to reset your password: ${token}`,
    html,
  });
};

export const sendWelcomeEmail = async (email, name) => {
  const subject = 'Welcome to MyApp 🎉';
  const html = `
    <div style="font-family: Arial, sans-serif; text-align: center;">
      <h2>Welcome to MyApp 🎉</h2>
      <p>Hi ${name},</p>
      <p>Thank you for joining us!</p>
    </div>
  `;

  await sendEmail({
    to: email,
    subject,
    text: `Hi ${name}, Thank you for joining us!`,
    html,
  });

  console.log(`📨 Welcome email sent to ${email}`);
};
