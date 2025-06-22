import nodemailer from 'nodemailer';

const isEmailConfigured = () => {
  return process.env.EMAIL_USER && process.env.EMAIL_PASSWORD;
};

const createTransporter = () => {
  if (!isEmailConfigured()) {
    throw new Error('Email credentials not configured. Please set EMAIL_USER and EMAIL_PASSWORD in your .env file');
  }

  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });
};

// Generate OTP
export const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export const sendOTPEmail = async (email, otp) => {
  try {
    if (!isEmailConfigured()) {
      console.error('Email credentials not configured. Please set EMAIL_USER and EMAIL_PASSWORD in your .env file');
      return false;
    }

    const transporter = createTransporter();
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Email Verification OTP - TapTik',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; text-align: center; color: white;">
            <h1 style="margin: 0;">TapTik</h1>
            <p style="margin: 10px 0 0 0;">Email Verification</p>
          </div>
          <div style="padding: 30px; background: #f9f9f9;">
            <h2 style="color: #333; margin-bottom: 20px;">Verify Your Email Address</h2>
            <p style="color: #666; line-height: 1.6; margin-bottom: 25px;">
              Thank you for signing up with TapTik! To complete your registration, please use the following verification code:
            </p>
            <div style="background: #fff; border: 2px solid #667eea; border-radius: 10px; padding: 20px; text-align: center; margin: 20px 0;">
              <h1 style="color: #667eea; font-size: 32px; margin: 0; letter-spacing: 5px; font-weight: bold;">${otp}</h1>
            </div>
            <p style="color: #666; line-height: 1.6; margin-bottom: 15px;">
              This code will expire in 10 minutes for security reasons.
            </p>
            <p style="color: #999; font-size: 14px; margin-top: 30px;">
              If you didn't create an account with TapTik, please ignore this email.
            </p>
          </div>
          <div style="background: #333; padding: 20px; text-align: center; color: white;">
            <p style="margin: 0; font-size: 14px;">© 2024 TapTik. All rights reserved.</p>
          </div>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
}; 