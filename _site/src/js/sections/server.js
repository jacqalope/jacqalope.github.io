const nodemailer = require('nodemailer');

// 1. Create the transporter using SMTP
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'jacqueline.h.haddenham@gmail.com', // Your email address
    pass: 'zwjp pbcc euqa blaa'      // 16-character App Password (not your normal password)
  }
});

// 2. Define the email options
const mailOptions = {
  from: 'your-email@gmail.com',
  to: 'recipient@example.com',
  subject: 'Hello from Nodemailer',
  text: 'This is a test email sent from Node.js!'
};

// 3. Send the email
transporter.sendMail(mailOptions, (error, info) => {
  if (error) {
    console.log('Error:', error);
  } else {
    console.log('Email sent:', info.response);
  }
});
