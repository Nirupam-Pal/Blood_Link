import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;
  private readonly logger = new Logger(EmailService.name);

  constructor(private readonly configService: ConfigService) {
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
  // <p>Hello,</p>
  // <p>Thank you for registering with BloodLink. Please use the following 6-digit One-Time Password (OTP) to complete your verification:</p>
  async sendOtpEmail(to: string, otp: string): Promise<void> {
    const mailOptions = {
      from: `"BloodLink Ecosystem" <${this.configService.get<string>('SMTP_USER')}>`,
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
      await this.transporter.sendMail(mailOptions);
      this.logger.log(`Verification OTP sent successfully to ${to}`);
    } catch (error) {
      this.logger.error(`Failed to send OTP email to ${to}`, error);
      throw new InternalServerErrorException(
        'Failed to dispatch verification email. Please try again later.',
      );
    }
  }
}
