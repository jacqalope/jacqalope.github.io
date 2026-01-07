const { google } = require('googleapis');
const nodemailer = require('nodemailer');

const OAuth2 = google.auth.OAuth2;

const {
  OAUTH_CLIENT_ID,
  OAUTH_CLIENT_SECRET,
  OAUTH_REDIRECT_URI,
  OAUTH_REFRESH_TOKEN,
  CONTACT_TO_EMAIL, // destination email address (set to jacqueline.h.haddenham@gmail.com in env)
} = process.env;

// Basic validation helper
const validatePayload = (payload) => {
  if (!payload) return false;
  const { name, email, subject, message } = payload;
  return (
    typeof name === 'string' &&
    name.trim().length > 0 &&
    typeof email === 'string' &&
    /\S+@\S+\.\S+/.test(email) &&
    typeof subject === 'string' &&
    subject.trim().length > 0 &&
    typeof message === 'string' &&
    message.trim().length > 0
  );
};

const createTransporter = async () => {
  if (!OAUTH_CLIENT_ID || !OAUTH_CLIENT_SECRET || !OAUTH_REFRESH_TOKEN || !OAUTH_REDIRECT_URI) {
    throw new Error('Missing Gmail OAuth2 configuration in environment variables.');
  }

  const oauth2Client = new OAuth2(
    OAUTH_CLIENT_ID,
    OAUTH_CLIENT_SECRET,
    OAUTH_REDIRECT_URI,
    OAUTH_REFRESH_TOKEN,
  );

  oauth2Client.setCredentials({ refresh_token: OAUTH_REFRESH_TOKEN });

  // Get access token (nodemailer can also accept a function that returns access token)
  const { accessToken } = await oauth2Client.getAccessToken();

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      type: 'OAuth2',
      user: CONTACT_TO_EMAIL, // The Gmail address used to send (should match the credentials)
      clientId: OAUTH_CLIENT_ID,
      clientSecret: OAUTH_CLIENT_SECRET,
      refreshToken: OAUTH_REFRESH_TOKEN,
      accessToken: accessToken,
    },
  });

  return transporter;
};

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Not Allowed' }) };
  }

  let payload;
  try {
    payload = JSON.parse(event.body);
  } catch (err) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Invalid JSON' }) };
  }

  if (!validatePayload(payload)) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Email and message are required.' }) };
  }

  const { name, email, subject, message } = payload;

  try {
    const transporter = await createTransporter();

    const mailOptions = {
      from: `"${name}" <${email}>`,
      to: process.env.CONTACT_TO_EMAIL,
      subject: `[Website Contact] ${subject}`,
      text: `You have a new message from your website contact form:\n\nName: ${name}\nEmail: ${email}\n\nMessage:\n${message}`,
      html: `
        <p>You have a new message from your website contact form:</p>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Message:</strong><br/>${message.replace(/\n/g, '<br/>')}</p>
      `,
    };

    await transporter.sendMail(mailOptions);

    return {
      statusCode: 200,
      body: JSON.stringify({ ok: true, message: 'Message sent' }),
    };
  } catch (err) {
    console.error('Contact function error:', err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to send message' }),
    };
  }
};