const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');

// POST /api/email/send-otp - Send OTP via email
router.post('/send-otp', async (req, res) => {
    try {
        const { email, otp, type } = req.body;

        if (!email || !otp) {
            return res.status(400).json({ error: 'Email and OTP are required' });
        }

        const emailSubject = type === '2fa_enable' 
            ? 'Your 2FA Verification Code - NextGenAI'
            : 'Your Login Verification Code - NextGenAI';

        const emailBody = `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%); padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }
                    .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
                    .otp-box { background: #fff; border: 2px solid #fbbf24; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0; }
                    .otp-code { font-size: 32px; font-weight: bold; color: #f59e0b; letter-spacing: 8px; font-family: monospace; }
                    .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 12px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1 style="color: white; margin: 0;">NextGenAI</h1>
                    </div>
                    <div class="content">
                        <h2>${type === '2fa_enable' ? 'Enable Two-Factor Authentication' : 'Login Verification'}</h2>
                        <p>Your verification code is:</p>
                        <div class="otp-box">
                            <div class="otp-code">${otp}</div>
                        </div>
                        <p>This code will expire in 10 minutes.</p>
                        <p>If you didn't request this code, please ignore this email.</p>
                        <div class="footer">
                            <p>© NextGenAI - AI-Powered Career Platform</p>
                        </div>
                    </div>
                </div>
            </body>
            </html>
        `;

        // Check if SMTP is configured
        const smtpUser = process.env.SMTP_USERNAME || process.env.SMTP_USER || process.env.SUPABASE_SMTP_USER;
        const smtpPass = process.env.SMTP_PASSWORD || process.env.SMTP_PASS || process.env.SUPABASE_SMTP_PASS;
        const smtpHost = process.env.SMTP_SERVER || process.env.SMTP_HOST || 'smtp.gmail.com';
        const smtpPort = process.env.SMTP_PORT || '587';

        if (!smtpUser || !smtpPass) {
            console.error('SMTP not configured. Please set SMTP_USERNAME and SMTP_PASSWORD in .env file');
            return res.status(500).json({ 
                error: 'Email service not configured. Please contact administrator.',
            });
        }

        // SMTP is configured - send email using nodemailer
        const transporter = nodemailer.createTransport({
            host: smtpHost,
            port: parseInt(smtpPort),
            secure: smtpPort === '465', // true for 465, false for other ports
            auth: {
                user: smtpUser,
                pass: smtpPass,
            },
        });

        // Send email using nodemailer
        const mailOptions = {
            from: process.env.FROM_EMAIL || process.env.SMTP_FROM || smtpUser,
            to: email,
            subject: emailSubject,
            html: emailBody,
        };

        await transporter.sendMail(mailOptions);

        res.json({ success: true, message: 'OTP sent successfully' });
    } catch (err) {
        console.error('Send OTP error:', err);
        // Log OTP for development if email fails
        if (req.body.email && req.body.otp) {
            console.log(`[DEV] Email failed. OTP for ${req.body.email}: ${req.body.otp}`);
        }
        res.status(500).json({ error: 'Failed to send OTP. Check server logs for OTP.' });
    }
});

module.exports = router;

