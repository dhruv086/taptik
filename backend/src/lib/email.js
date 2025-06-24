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
            <p style="margin: 0; font-size: 14px;">© 2025 TapTik. All rights reserved.</p>
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

// Send welcome email
export const sendWelcomeEmail = async (email, fullname) => {
  try {
    // Check if email is configured
    if (!isEmailConfigured()) {
      console.error('Email credentials not configured. Please set EMAIL_USER and EMAIL_PASSWORD in your .env file');
      return false;
    }

    const transporter = createTransporter();
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Welcome to TapTik! 🎉',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; color: white;">
            <h1 style="margin: 0; font-size: 32px;">🎉 Welcome to TapTik!</h1>
            <p style="margin: 10px 0 0 0; font-size: 18px;">Your account has been successfully created</p>
          </div>
          
          <div style="padding: 40px; background: #f9f9f9;">
            <h2 style="color: #333; margin-bottom: 20px;">Hello ${fullname}! 👋</h2>
            
            <p style="color: #666; line-height: 1.8; margin-bottom: 25px; font-size: 16px;">
              Welcome to TapTik! We're excited to have you join our community. You're now ready to connect with friends, 
              share moments, and stay in touch with your loved ones.
            </p>
            
            <div style="background: #fff; border-left: 4px solid #667eea; padding: 20px; margin: 25px 0; border-radius: 0 8px 8px 0;">
              <h3 style="color: #667eea; margin: 0 0 15px 0;">🔒 Your Privacy & Security</h3>
              <p style="color: #666; line-height: 1.6; margin: 0; font-size: 15px;">
                <strong>End-to-End Encryption:</strong> All your messages and conversations are protected with 
                industry-standard end-to-end encryption. This means only you and the person you're chatting with 
                can read your messages - not even we can access them.
              </p>
            </div>
            
            <div style="background: #fff; border-left: 4px solid #28a745; padding: 20px; margin: 25px 0; border-radius: 0 8px 8px 0;">
              <h3 style="color: #28a745; margin: 0 0 15px 0;">✨ What You Can Do</h3>
              <ul style="color: #666; line-height: 1.8; margin: 0; padding-left: 20px; font-size: 15px;">
                <li>Send secure, encrypted messages to friends</li>
                <li>Share photos and media safely</li>
                <li>Create group conversations</li>
                <li>Customize your profile</li>
                <li>Stay connected with real-time notifications</li>
              </ul>
            </div>
            
            
            <p style="color: #666; line-height: 1.6; margin-top: 30px; font-size: 14px;">
              If you have any questions or need help getting started, feel free to reach out to our support team.
            </p>
          </div>
          
          <div style="background: #333; padding: 25px; text-align: center; color: white;">
            <p style="margin: 0 0 10px 0; font-size: 16px;">Thank you for choosing TapTik!</p>
            <p style="margin: 0; font-size: 14px; color: #ccc;">© 2025 TapTik. All rights reserved.</p>
          </div>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Error sending welcome email:', error);
    return false;
  }
};

// Send activity notification email
export const sendActivityNotification = async (activityType, userData) => {
  try {
    // Check if email is configured
    if (!isEmailConfigured()) {
      console.error('Email credentials not configured. Please set EMAIL_USER and EMAIL_PASSWORD in your .env file');
      return false;
    }

    const transporter = createTransporter();
    
    const getActivitySubject = () => {
      switch (activityType) {
        case 'signup':
          return '🆕 New User Signup - TapTik';
        case 'login':
          return '🔐 User Login - TapTik';
        default:
          return '📊 User Activity - TapTik';
      }
    };

    const getActivityContent = () => {
      const timestamp = new Date().toLocaleString();
      const userInfo = `
        <strong>User Details:</strong><br>
        • Name: ${userData.fullname}<br>
        • Email: ${userData.email}<br>
        • Username: ${userData.username}<br>
        • Time: ${timestamp}<br>
        • IP Address: ${userData.ip || 'Not available'}
      `;

      switch (activityType) {
        case 'signup':
          return `
            <div style="background: #fff; border-left: 4px solid #28a745; padding: 20px; margin: 25px 0; border-radius: 0 8px 8px 0;">
              <h3 style="color: #28a745; margin: 0 0 15px 0;">🆕 New User Registration</h3>
              <p style="color: #666; line-height: 1.6; margin: 0; font-size: 15px;">
                A new user has successfully created an account on TapTik.
              </p>
            </div>
            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
              ${userInfo}
            </div>
          `;
        case 'login':
          return `
            <div style="background: #fff; border-left: 4px solid #007bff; padding: 20px; margin: 25px 0; border-radius: 0 8px 8px 0;">
              <h3 style="color: #007bff; margin: 0 0 15px 0;">🔐 User Login</h3>
              <p style="color: #666; line-height: 1.6; margin: 0; font-size: 15px;">
                A user has successfully logged into their TapTik account.
              </p>
            </div>
            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
              ${userInfo}
            </div>
          `;
        default:
          return `
            <div style="background: #fff; border-left: 4px solid #6c757d; padding: 20px; margin: 25px 0; border-radius: 0 8px 8px 0;">
              <h3 style="color: #6c757d; margin: 0 0 15px 0;">📊 User Activity</h3>
              <p style="color: #666; line-height: 1.6; margin: 0; font-size: 15px;">
                User activity has been detected on TapTik.
              </p>
            </div>
            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
              ${userInfo}
            </div>
          `;
      }
    };
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: 'taptikactivity@gmail.com',
      subject: getActivitySubject(),
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 25px; text-align: center; color: white;">
            <h1 style="margin: 0; font-size: 28px;">📊 TapTik Activity Monitor</h1>
            <p style="margin: 10px 0 0 0; font-size: 16px;">User Activity Notification</p>
          </div>
          
          <div style="padding: 30px; background: #f9f9f9;">
            <h2 style="color: #333; margin-bottom: 20px;">Activity Alert</h2>
            
            ${getActivityContent()}
            
            <div style="background: #fff; border-left: 4px solid #ffc107; padding: 20px; margin: 25px 0; border-radius: 0 8px 8px 0;">
              <h3 style="color: #ffc107; margin: 0 0 15px 0;">📈 Platform Statistics</h3>
              <p style="color: #666; line-height: 1.6; margin: 0; font-size: 15px;">
                This notification helps you monitor user engagement and platform activity. 
                You can use this information to track growth and user behavior patterns.
              </p>
            </div>
            
            <p style="color: #666; line-height: 1.6; margin-top: 30px; font-size: 14px;">
              This is an automated notification from the TapTik activity monitoring system.
            </p>
          </div>
          
          <div style="background: #333; padding: 20px; text-align: center; color: white;">
            <p style="margin: 0; font-size: 14px; color: #ccc;">© 2025 TapTik. All rights reserved.</p>
          </div>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Error sending activity notification email:', error);
    return false;
  }
};

export const sendFriendRequestEmail = async (receiverEmail, receiverName, senderName, senderUsername) => {
  try {
    if (!isEmailConfigured()) {
      console.error('Email credentials not configured. Please set EMAIL_USER and EMAIL_PASSWORD in your .env file');
      return false;
    }
    const transporter = createTransporter();
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: receiverEmail,
      subject: `New Friend Request on TapTik!`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; text-align: center; color: white;">
            <h1 style="margin: 0;">TapTik</h1>
            <p style="margin: 10px 0 0 0;">New Friend Request</p>
          </div>
          <div style="padding: 30px; background: #f9f9f9;">
            <h2 style="color: #333; margin-bottom: 20px;">Hello ${receiverName},</h2>
            <p style="color: #666; line-height: 1.6; margin-bottom: 25px;">
              <strong>${senderName}</strong> (@${senderUsername}) has sent you a friend request on TapTik!<br/>
              Log in to your account to accept or decline the request.
            </p>
            <p style="color: #999; font-size: 14px; margin-top: 30px;">
              If you don't recognize this user, you can safely ignore this email.
            </p>
          </div>
          <div style="background: #333; padding: 20px; text-align: center; color: white;">
            <p style="margin: 0; font-size: 14px;">© 2025 TapTik. All rights reserved.</p>
          </div>
        </div>
      `,
    };
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Error sending friend request email:', error);
    return false;
  }
};

export const sendPasswordResetEmail = async (email, fullname) => {
  try {
    if (!isEmailConfigured()) {
      console.error('Email credentials not configured. Please set EMAIL_USER and EMAIL_PASSWORD in your .env file');
      return false;
    }
    const transporter = createTransporter();
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Your TapTik Password Was Changed',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; text-align: center; color: white;">
            <h1 style="margin: 0;">TapTik</h1>
            <p style="margin: 10px 0 0 0;">Password Changed</p>
          </div>
          <div style="padding: 30px; background: #f9f9f9;">
            <h2 style="color: #333; margin-bottom: 20px;">Hello ${fullname},</h2>
            <p style="color: #666; line-height: 1.6; margin-bottom: 25px;">
              This is a confirmation that your TapTik account password was changed. If you did not perform this action, please contact support immediately.
            </p>
            <p style="color: #999; font-size: 14px; margin-top: 30px;">
              If you did change your password, you can safely ignore this email.
            </p>
          </div>
          <div style="background: #333; padding: 20px; text-align: center; color: white;">
            <p style="margin: 0; font-size: 14px;">© 2025 TapTik. All rights reserved.</p>
          </div>
        </div>
      `,
    };
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Error sending password reset email:', error);
    return false;
  }
}; 