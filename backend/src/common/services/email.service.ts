import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

const BREVO_API_URL = 'https://api.brevo.com/v3/smtp/email';
const SENDER_NAME = 'BloodLink Ecosystem';

type EmailMessage = { to: string; subject: string; html: string };

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

/**
 * Sends email through Brevo's HTTPS API when BREVO_API_KEY is set (production —
 * hosts like Render's free tier block outbound SMTP ports), otherwise falls back
 * to SMTP via nodemailer (local development).
 */
@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private readonly brevoApiKey?: string;
  private readonly senderEmail?: string;
  private readonly frontendUrl: string;
  private transporter?: nodemailer.Transporter;

  constructor(private readonly configService: ConfigService) {
    this.brevoApiKey = this.configService.get<string>('BREVO_API_KEY');
    // Base URL used for links in notification emails
    this.frontendUrl = this.configService
      .get<string>('FRONTEND_URL', 'http://localhost:3000')
      .replace(/\/+$/, '');
    // Must be a sender verified in Brevo (Senders, Domains & Dedicated IPs → Senders)
    this.senderEmail =
      this.configService.get<string>('EMAIL_FROM') ||
      this.configService.get<string>('SMTP_USER');

    if (!this.brevoApiKey) {
      this.transporter = nodemailer.createTransport({
        host: this.configService.get<string>('SMTP_HOST', 'smtp.gmail.com'),
        port: this.configService.get<number>('SMTP_PORT', 587),
        secure: false,
        auth: {
          user: this.configService.get<string>('SMTP_USER'),
          pass: this.configService.get<string>('SMTP_PASS'),
        },
      });
    }

    this.logger.log(
      `Email provider: ${this.brevoApiKey ? 'Brevo API' : 'SMTP'}`,
    );
  }

  async sendOtpEmail(to: string, otp: string): Promise<void> {
    const message: EmailMessage = {
      to,
      subject: 'BloodLink - Verify Your Email Address',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f9f9f9;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 30px; border-radius: 8px; border: 1px solid #e0e0e0;">
            <h2 style="color: #d9534f; margin-top: 0;">BloodLink Email Verification</h2>
            <p>Hello,</p>
            <p>Thank you for registering with BloodLink. Please use the following 6-digit One-Time Password (OTP) to complete your verification:</p>
            <div style="background-color: #f4f4f4; padding: 15px; text-align: center; border-radius: 6px; font-size: 28px; font-weight: bold; letter-spacing: 4px; color: #333; margin: 20px 0;">
              ${otp}
            </div>
            <p style="color: #777; font-size: 13px;">This OTP is valid for <strong>10 minutes</strong>. Do not share this code with anyone.</p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
            <p style="color: #999; font-size: 12px; margin-bottom: 0;">If you did not request this email, please ignore it.</p>
          </div>
        </div>
      `,
    };

    try {
      await this.send(message);
      this.logger.log(`Verification OTP sent successfully to ${to}`);
    } catch (error) {
      this.logger.error(`Failed to send OTP email to ${to}`, error);
      throw new InternalServerErrorException(
        'Failed to dispatch verification email. Please try again later.',
      );
    }
  }

  /**
   * Mirrors an in-app notification to the user's inbox. Never throws — a failed
   * email must not break the action that triggered the notification.
   */
  async sendNotificationEmail(data: {
    to: string;
    name: string;
    title: string;
    message: string;
    actionPath?: string;
  }): Promise<void> {
    const actionUrl = `${this.frontendUrl}${data.actionPath ?? '/notifications'}`;
    const message: EmailMessage = {
      to: data.to,
      subject: `BloodLink - ${data.title}`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f9f9f9;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 30px; border-radius: 8px; border: 1px solid #e0e0e0;">
            <h2 style="color: #d9534f; margin-top: 0;">${escapeHtml(data.title)}</h2>
            <p>Hello ${escapeHtml(data.name)},</p>
            <p>${escapeHtml(data.message)}</p>
            <div style="text-align: center; margin: 28px 0;">
              <a href="${escapeHtml(actionUrl)}" style="background-color: #d9534f; color: #ffffff; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: bold; display: inline-block;">Open BloodLink</a>
            </div>
            <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
            <p style="color: #999; font-size: 12px; margin-bottom: 0;">You are receiving this email because you have an account on BloodLink.</p>
          </div>
        </div>
      `,
    };

    try {
      await this.send(message);
      this.logger.log(`Notification email "${data.title}" sent to ${data.to}`);
    } catch (error) {
      this.logger.error(`Failed to send notification email to ${data.to}`, error);
    }
  }

  private async send(message: EmailMessage): Promise<void> {
    if (this.brevoApiKey) {
      return this.sendWithBrevo(message);
    }
    await this.transporter!.sendMail({
      from: `"${SENDER_NAME}" <${this.senderEmail}>`,
      to: message.to,
      subject: message.subject,
      html: message.html,
    });
  }

  private async sendWithBrevo(message: EmailMessage): Promise<void> {
    if (!this.senderEmail) {
      throw new Error('EMAIL_FROM is not configured for Brevo.');
    }

    const response = await fetch(BREVO_API_URL, {
      method: 'POST',
      headers: {
        accept: 'application/json',
        'content-type': 'application/json',
        'api-key': this.brevoApiKey!,
      },
      body: JSON.stringify({
        sender: { name: SENDER_NAME, email: this.senderEmail },
        to: [{ email: message.to }],
        subject: message.subject,
        htmlContent: message.html,
      }),
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
      const details = await response.text().catch(() => '');
      throw new Error(`Brevo API responded ${response.status}: ${details}`);
    }
  }
}
