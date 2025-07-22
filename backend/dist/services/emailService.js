"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.emailService = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
class EmailService {
    constructor() {
        this.transporter = nodemailer_1.default.createTransporter({
            host: process.env.SMTP_HOST || 'smtp.gmail.com',
            port: parseInt(process.env.SMTP_PORT || '587'),
            secure: process.env.SMTP_SECURE === 'true',
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });
    }
    async sendEmail(options) {
        try {
            const mailOptions = {
                from: process.env.EMAIL_FROM || 'noreply@assureme.com',
                to: options.to,
                subject: options.subject,
                html: options.html,
                text: options.text,
            };
            await this.transporter.sendMail(mailOptions);
            console.log(`Email sent successfully to ${options.to}`);
            return true;
        }
        catch (error) {
            console.error('Failed to send email:', error);
            return false;
        }
    }
    async sendWelcomeEmail(data) {
        const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Welcome to AssureMe</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #007BFF; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background: #f9f9f9; }
            .button { display: inline-block; padding: 12px 24px; background: #007BFF; color: white; text-decoration: none; border-radius: 4px; }
            .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Welcome to AssureMe</h1>
            </div>
            <div class="content">
              <h2>Hello ${data.firstName}!</h2>
              <p>Welcome to AssureMe Insurance! Your account has been successfully created.</p>
              <p><strong>Email:</strong> ${data.email}</p>
              ${data.temporaryPassword ? `<p><strong>Temporary Password:</strong> ${data.temporaryPassword}</p>` : ''}
              <p>You can now log in to your account and start managing your insurance policies.</p>
              <p style="text-align: center; margin: 30px 0;">
                <a href="${process.env.FRONTEND_URL}/login" class="button">Login to Your Account</a>
              </p>
              ${data.temporaryPassword ? '<p><em>Please change your password after your first login for security.</em></p>' : ''}
            </div>
            <div class="footer">
              <p>This email was sent by AssureMe Insurance. If you have any questions, please contact our support team.</p>
            </div>
          </div>
        </body>
      </html>
    `;
        return this.sendEmail({
            to: data.email,
            subject: 'Welcome to AssureMe Insurance',
            html,
            text: `Welcome to AssureMe, ${data.firstName}! Your account has been created successfully. Login at ${process.env.FRONTEND_URL}/login`,
        });
    }
    async sendPasswordResetEmail(data) {
        const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Reset Your Password - AssureMe</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #007BFF; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background: #f9f9f9; }
            .button { display: inline-block; padding: 12px 24px; background: #007BFF; color: white; text-decoration: none; border-radius: 4px; }
            .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; }
            .warning { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 4px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Password Reset Request</h1>
            </div>
            <div class="content">
              <h2>Hello ${data.firstName}!</h2>
              <p>You requested to reset your password for your AssureMe account.</p>
              <p>Click the button below to reset your password:</p>
              <p style="text-align: center; margin: 30px 0;">
                <a href="${data.resetUrl}" class="button">Reset Password</a>
              </p>
              <div class="warning">
                <p><strong>Security Notice:</strong></p>
                <ul>
                  <li>This link will expire in 1 hour</li>
                  <li>If you didn't request this reset, please ignore this email</li>
                  <li>Never share this link with anyone</li>
                </ul>
              </div>
              <p>If the button doesn't work, copy and paste this link into your browser:</p>
              <p style="word-break: break-all; background: #f0f0f0; padding: 10px; border-radius: 4px;">${data.resetUrl}</p>
            </div>
            <div class="footer">
              <p>This email was sent by AssureMe Insurance. If you have any questions, please contact our support team.</p>
            </div>
          </div>
        </body>
      </html>
    `;
        return this.sendEmail({
            to: data.resetUrl.split('?')[0], // Extract email from reset URL or pass separately
            subject: 'Reset Your AssureMe Password',
            html,
            text: `Reset your AssureMe password by visiting: ${data.resetUrl}`,
        });
    }
    async sendClaimUpdateEmail(email, data) {
        const statusColors = {
            APPROVED: '#28a745',
            REJECTED: '#dc3545',
            UNDER_REVIEW: '#ffc107',
            PAID: '#28a745',
            CLOSED: '#6c757d',
        };
        const statusColor = statusColors[data.status] || '#007BFF';
        const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Claim Update - AssureMe</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #007BFF; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background: #f9f9f9; }
            .status-badge { display: inline-block; padding: 8px 16px; border-radius: 20px; color: white; font-weight: bold; background: ${statusColor}; }
            .button { display: inline-block; padding: 12px 24px; background: #007BFF; color: white; text-decoration: none; border-radius: 4px; }
            .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Claim Status Update</h1>
            </div>
            <div class="content">
              <h2>Hello ${data.firstName}!</h2>
              <p>There's an update on your insurance claim:</p>
              <p><strong>Claim Number:</strong> ${data.claimNumber}</p>
              <p><strong>New Status:</strong> <span class="status-badge">${data.status.replace('_', ' ')}</span></p>
              ${data.message ? `<p><strong>Message:</strong> ${data.message}</p>` : ''}
              <p style="text-align: center; margin: 30px 0;">
                <a href="${process.env.FRONTEND_URL}/client/claims" class="button">View Claim Details</a>
              </p>
            </div>
            <div class="footer">
              <p>This email was sent by AssureMe Insurance. If you have any questions, please contact our support team.</p>
            </div>
          </div>
        </body>
      </html>
    `;
        return this.sendEmail({
            to: email,
            subject: `Claim Update: ${data.claimNumber}`,
            html,
            text: `Your claim ${data.claimNumber} status has been updated to: ${data.status}. ${data.message || ''}`,
        });
    }
    async sendPolicyRenewalReminder(email, user, policyNumber, renewalDate) {
        const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Policy Renewal Reminder - AssureMe</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #007BFF; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background: #f9f9f9; }
            .button { display: inline-block; padding: 12px 24px; background: #007BFF; color: white; text-decoration: none; border-radius: 4px; }
            .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; }
            .reminder-box { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 4px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Policy Renewal Reminder</h1>
            </div>
            <div class="content">
              <h2>Hello ${user.firstName}!</h2>
              <div class="reminder-box">
                <p><strong>Important:</strong> Your insurance policy is due for renewal soon.</p>
              </div>
              <p><strong>Policy Number:</strong> ${policyNumber}</p>
              <p><strong>Renewal Date:</strong> ${renewalDate.toLocaleDateString()}</p>
              <p>To ensure continuous coverage, please review and renew your policy before the expiration date.</p>
              <p style="text-align: center; margin: 30px 0;">
                <a href="${process.env.FRONTEND_URL}/client/policies" class="button">Renew Policy</a>
              </p>
            </div>
            <div class="footer">
              <p>This email was sent by AssureMe Insurance. If you have any questions, please contact our support team.</p>
            </div>
          </div>
        </body>
      </html>
    `;
        return this.sendEmail({
            to: email,
            subject: `Policy Renewal Reminder: ${policyNumber}`,
            html,
            text: `Your policy ${policyNumber} is due for renewal on ${renewalDate.toLocaleDateString()}. Please log in to renew your policy.`,
        });
    }
    // Test email connection
    async testConnection() {
        try {
            await this.transporter.verify();
            console.log('Email service connection verified');
            return true;
        }
        catch (error) {
            console.error('Email service connection failed:', error);
            return false;
        }
    }
}
exports.emailService = new EmailService();
exports.default = exports.emailService;
//# sourceMappingURL=emailService.js.map