const nodemailer = require('nodemailer');

exports.handler = async (event, context) => {
    // 1. Enforce POST method to match your netlify.toml config
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    // 2. Parse the incoming JSON from Contact.js
    const { name, email, message } = JSON.parse(event.body);

    // 3. Configure the Transporter using environment variables
    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: 587,
        secure: false, // true for 465, false for 587
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
    });

    // 4. Send the email
    try {
        await transporter.sendMail({
            from: `"${name}" <${process.env.SMTP_USER}>`,
            to: "your-email@example.com", // Where you want to receive submissions
            subject: `New Contact Form Submission: ${name}`,
            text: `Name: ${name}\nEmail: ${email}\nMessage: ${message}`,
            html: `<p><strong>Name:</strong> ${name}</p>
                   <p><strong>Email:</strong> ${email}</p>
                   <p><strong>Message:</strong> ${message}</p>`
        });

        return {
            statusCode: 200,
            body: JSON.stringify({ message: 'Email sent successfully!' })
        };
    } catch (error) {
        console.error('Nodemailer Error:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Failed to send email.' })
        };
    }
};
