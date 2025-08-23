import nodemailer from 'nodemailer';
import { config } from '@/config/environment';
import { logger } from '@/utils/logger';

export interface EmailOptions {
  to: string | string[];
  subject: string;
  text?: string;
  html?: string;
  attachments?: Array<{
    filename: string;
    content: Buffer | string;
    contentType?: string;
  }>;
}

class EmailService {
  private transporter: nodemailer.Transporter | null = null;

  async initialize(): Promise<void> {
    if (!config.email.user || !config.email.pass) {
      logger.warn('Email service not configured - emails will be disabled');
      return;
    }

    this.transporter = nodemailer.createTransport({
      host: config.email.host,
      port: config.email.port,
      secure: config.email.port === 465,
      auth: {
        user: config.email.user,
        pass: config.email.pass,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });

    logger.info('Email service initialized');
  }

  async testConnection(): Promise<boolean> {
    if (!this.transporter) {
      return false;
    }

    try {
      await this.transporter.verify();
      logger.info('Email service connection verified');
      return true;
    } catch (error) {
      logger.error('Email service connection failed:', error);
      return false;
    }
  }

  async sendEmail(options: EmailOptions): Promise<boolean> {
    if (!this.transporter) {
      logger.warn('Email service not available - skipping email send');
      return false;
    }

    try {
      const mailOptions = {
        from: config.email.from,
        to: Array.isArray(options.to) ? options.to.join(', ') : options.to,
        subject: options.subject,
        text: options.text,
        html: options.html,
        attachments: options.attachments,
      };

      const result = await this.transporter.sendMail(mailOptions);
      logger.info('Email sent successfully', { 
        messageId: result.messageId,
        to: options.to,
        subject: options.subject,
      });
      return true;
    } catch (error) {
      logger.error('Failed to send email:', error);
      return false;
    }
  }

  async sendWelcomeEmail(userEmail: string, userName: string): Promise<boolean> {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #2c3e50;">Welcome to PHV Budget Tracker!</h1>
        <p>Hello ${userName},</p>
        <p>Thank you for joining PHV Budget Tracker - Singapore's premier expense and earnings management platform for Private Hire Vehicle drivers.</p>
        
        <h2>Getting Started:</h2>
        <ul>
          <li>Connect your Singapore bank accounts for automatic transaction syncing</li>
          <li>Upload receipts and let our OCR extract expense details</li>
          <li>Track earnings from Grab, Gojek, Ryde, and other platforms</li>
          <li>Monitor your PHV business performance with detailed analytics</li>
        </ul>
        
        <p>Start tracking your expenses and earnings today to maximize your profits!</p>
        
        <p>Best regards,<br>The PHV Budget Tracker Team</p>
      </div>
    `;

    return this.sendEmail({
      to: userEmail,
      subject: 'Welcome to PHV Budget Tracker',
      html,
    });
  }

  async sendPasswordResetEmail(userEmail: string, resetToken: string): Promise<boolean> {
    const resetLink = `${config.server.frontendUrl}/reset-password?token=${resetToken}`;
    
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #2c3e50;">Password Reset Request</h1>
        <p>You have requested to reset your password for PHV Budget Tracker.</p>
        <p>Click the link below to reset your password:</p>
        <p>
          <a href="${resetLink}" style="background-color: #3498db; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
            Reset Password
          </a>
        </p>
        <p>This link will expire in 1 hour.</p>
        <p>If you didn't request this password reset, please ignore this email.</p>
        
        <p>Best regards,<br>The PHV Budget Tracker Team</p>
      </div>
    `;

    return this.sendEmail({
      to: userEmail,
      subject: 'Password Reset Request - PHV Budget Tracker',
      html,
    });
  }

  async sendMonthlyReport(userEmail: string, reportData: any): Promise<boolean> {
    const { totalEarnings, totalExpenses, netProfit, topPlatform, workingDays } = reportData;
    
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #2c3e50;">Your Monthly PHV Report</h1>
        <p>Here's your performance summary for the past month:</p>
        
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h2 style="margin-top: 0;">Financial Summary</h2>
          <p><strong>Total Earnings:</strong> $${totalEarnings.toFixed(2)}</p>
          <p><strong>Total Expenses:</strong> $${totalExpenses.toFixed(2)}</p>
          <p><strong>Net Profit:</strong> $${netProfit.toFixed(2)}</p>
          <p><strong>Working Days:</strong> ${workingDays}</p>
        </div>
        
        <div style="background-color: #e8f5e8; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h2 style="margin-top: 0;">Performance Insights</h2>
          <p><strong>Top Platform:</strong> ${topPlatform}</p>
          <p><strong>Daily Average:</strong> $${(totalEarnings / workingDays).toFixed(2)}</p>
        </div>
        
        <p>Log in to view detailed analytics and optimize your earnings!</p>
        
        <p>Best regards,<br>The PHV Budget Tracker Team</p>
      </div>
    `;

    return this.sendEmail({
      to: userEmail,
      subject: 'Your Monthly PHV Report',
      html,
    });
  }

  async sendLowProfitAlert(userEmail: string, alertData: any): Promise<boolean> {
    const { currentProfit, averageProfit, period } = alertData;
    
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #e74c3c;">Profit Alert: Action Needed</h1>
        <p>Your recent earnings performance needs attention.</p>
        
        <div style="background-color: #ffeaa7; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h2 style="margin-top: 0;">Alert Details</h2>
          <p><strong>Current ${period} Profit:</strong> $${currentProfit.toFixed(2)}</p>
          <p><strong>Your Average:</strong> $${averageProfit.toFixed(2)}</p>
          <p><strong>Difference:</strong> ${((currentProfit - averageProfit) / averageProfit * 100).toFixed(1)}%</p>
        </div>
        
        <h3>Recommended Actions:</h3>
        <ul>
          <li>Review your recent expenses for any unusual spending</li>
          <li>Check if you're working during peak earning hours</li>
          <li>Consider optimizing your platform usage</li>
          <li>Review your vehicle maintenance costs</li>
        </ul>
        
        <p>Log in to your dashboard to see detailed recommendations.</p>
        
        <p>Best regards,<br>The PHV Budget Tracker Team</p>
      </div>
    `;

    return this.sendEmail({
      to: userEmail,
      subject: 'PHV Profit Alert - Action Needed',
      html,
    });
  }

  async sendReceiptProcessingNotification(userEmail: string, receiptCount: number, successCount: number): Promise<boolean> {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #2c3e50;">Receipt Processing Complete</h1>
        <p>Your uploaded receipts have been processed.</p>
        
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h2 style="margin-top: 0;">Processing Summary</h2>
          <p><strong>Total Receipts:</strong> ${receiptCount}</p>
          <p><strong>Successfully Processed:</strong> ${successCount}</p>
          <p><strong>Success Rate:</strong> ${((successCount / receiptCount) * 100).toFixed(1)}%</p>
        </div>
        
        <p>Log in to review the extracted data and create expenses from your receipts.</p>
        
        <p>Best regards,<br>The PHV Budget Tracker Team</p>
      </div>
    `;

    return this.sendEmail({
      to: userEmail,
      subject: 'Receipt Processing Complete',
      html,
    });
  }

  async sendBankSyncNotification(userEmail: string, bankName: string, transactionCount: number): Promise<boolean> {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #2c3e50;">Bank Sync Complete</h1>
        <p>Your ${bankName} account has been synchronized.</p>
        
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h2 style="margin-top: 0;">Sync Summary</h2>
          <p><strong>Bank:</strong> ${bankName}</p>
          <p><strong>New Transactions:</strong> ${transactionCount}</p>
        </div>
        
        <p>Review your transactions and categorize them for better expense tracking.</p>
        
        <p>Best regards,<br>The PHV Budget Tracker Team</p>
      </div>
    `;

    return this.sendEmail({
      to: userEmail,
      subject: `${bankName} Account Synchronized`,
      html,
    });
  }
}

export const emailService = new EmailService();