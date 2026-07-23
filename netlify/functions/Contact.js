const nodemailer = require('nodemailer');

exports.handler = async (event, context) => {
  // CORS Headers (Allows frontend requests to communicate smoothly)
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };

  // Handle CORS preflight options request
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  // 1. Enforce POST method
  if (event.httpMethod !== 'POST') {
    return { 
      statusCode: 405, 
      headers, 
      body: JSON.stringify({ error: 'Method Not Allowed' }) 
    };
  }

  try {
    // 2. Safe Parsing
    if (!event.body) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Request body is empty.' })
      };
    }

    const { name, email, message } = JSON.parse(event.body);

    // 3. Server-side Validation
    if (!name || !email || !message) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Missing required fields.' })
      };
    }

    // 4. Configure Transporter
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: 587,
      secure: false, // true for 465, false for 587
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    // 5. Send Email
    await transporter.sendMail({
      from: `"${name}" <${process.env.SMTP_USER}>`,
      to: "jacqueline.h.haddenham@gmail.com",
      subject: `New Contact Form Submission: ${name}`,
      text: `Name: ${name}\nEmail: ${email}\nMessage: ${message}`,
      html: `
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Message:</strong> ${message}</p>
      `
    });

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ message: 'Email sent successfully!' })
    };

  } catch (error) {
    console.error('Nodemailer Error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Failed to send email.' })
    };
  }
};