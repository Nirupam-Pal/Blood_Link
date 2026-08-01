import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersRepository } from '../users/repositories/users.repository';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Otp } from './schemas/otp.schema';
import { Model } from 'mongoose';
import { EmailService } from '../../common/services/email.service';
import { SendOtpDto } from './dto/send-otp.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    @InjectModel(Otp.name) private readonly otpModel: Model<Otp>,
    private readonly emailService: EmailService,
  ) {}

  async login(loginDto: LoginDto) {
    const user = await this.usersRepository.findOne(
      { email: loginDto.email },
      '+password +refreshTokenHash',
    );

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      user.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid Credentials');
    }

    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const accessToken = await this.jwtService.signAsync(payload);

    const refreshToken = await this.jwtService.signAsync(payload, {
      secret: this.configService.getOrThrow('JWT_REFRESH_SECRET'),
      expiresIn: this.configService.getOrThrow('JWT_REFRESH_EXPIRES_IN'),
    });

    const refreshHash = await bcrypt.hash(refreshToken, 12);

    await this.usersRepository.update(user.id, {
      refreshTokenHash: refreshHash,
    });

    return {
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
      },
      accessToken,
      refreshToken,
    };
  }

  async sendOtp(sendOtpDto: SendOtpDto): Promise<{ message: string }> {
    const email = sendOtpDto.email.toLowerCase();

    const otp = crypto.randomInt(100000, 999999).toString();

    const salt = await bcrypt.genSalt(10);
    const otpHash = await bcrypt.hash(otp, salt);

    await this.otpModel.findOneAndUpdate(
      { email },
      {
        otpHash,
        attempts: 0,
        createdAt: new Date()
      },
      { upsert: true, new: true }
    );

    await this.emailService.sendOtpEmail(email, otp);

    return { message: 'Verification OTP sent successfully to your email.' };
  }
}
