const nodemailer = require('nodemailer');

// Create a test account for development
const createTestAccount = async () => {
  try {
    const testAccount = await nodemailer.createTestAccount();
    return {
      user: testAccount.user,
      pass: testAccount.pass
    };
  } catch (error) {
    console.error('Error creating test account:', error);
    return null;
  }
};

// Use test account for development
const getTransporter = async () => {
  if (process.env.NODE_ENV === 'development') {
    const testAccount = await createTestAccount();
    if (testAccount) {
      return nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass
        }
      });
    }
  }

  // Production configuration
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    }
  });
};

const sendEmail = async (to, subject, text) => {
  try {
    const transporter = await getTransporter();
    
    const mailOptions = {
      from: `"Green Bin" <${process.env.EMAIL_USER || 'test@ethereal.email'}>`,
      to,
      subject,
      text,
      html: `<p>${text}</p>`
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.messageId);
    
    // In development, log the preview URL
    if (process.env.NODE_ENV === 'development') {
      console.log('Preview URL:', nodemailer.getTestMessageUrl(info));
    }
    
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error('Failed to send email: ' + error.message);
  }
};

module.exports = { sendEmail }; 