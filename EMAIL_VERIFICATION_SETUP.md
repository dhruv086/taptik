# Email Verification Setup Guide

## Backend Configuration

To enable email verification, you need to add the following environment variables to your `.env` file:

```env
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
```

## Gmail App Password Setup

1. Go to your Google Account settings
2. Navigate to Security
3. Enable 2-Step Verification if not already enabled
4. Go to App passwords
5. Generate a new app password for "Mail"
6. Use this app password as `EMAIL_PASSWORD` in your `.env` file

## Important Notes

- The email verification system uses Gmail SMTP
- OTP expires after 10 minutes
- Users must verify their email before completing signup
- The system creates temporary users during the verification process

## Features

- ✅ Send OTP button next to email field
- ✅ OTP input field appears after sending
- ✅ Verify button to submit OTP
- ✅ Green checkmark when email is verified
- ✅ Form validation requires email verification
- ✅ Backend API endpoints for OTP functionality
- ✅ Email templates with professional design

## API Endpoints

- `POST /auth/send-otp` - Send OTP to email
- `POST /auth/verify-otp` - Verify OTP
- `POST /auth/signup` - Complete signup (requires verified email) 