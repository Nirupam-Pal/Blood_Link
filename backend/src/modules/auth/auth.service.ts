import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
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
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { NotFoundError } from 'rxjs';
import { BloodBanksRepository } from '../blood-banks/repositories/blood-banks.repository';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly bloodBankRepository: BloodBanksRepository,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    @InjectModel(Otp.name) private readonly otpModel: Model<Otp>,
    private readonly emailService: EmailService,
  ) {}

  async login(loginDto: LoginDto) {
    const email = loginDto.email.toLowerCase();

    let account: any = await this.usersRepository.findOne(
      {email},
      '+password +refreshTokenHash',
    );

    let role = account?.role || 'USER';

    if(!account) {
      account = await this.bloodBankRepository.findOne(
        { email },
        '+password +refreshTokenHash'
      );
      role = 'BLOOD_BANK'
    }

    if(!account) {
      throw new UnauthorizedException('Invalid Credentials');
    }


    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      account.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid Credentials');
    }

    const payload = {
      sub: account._id || account.id,
      email: account.email,
      role
    };

    const accessToken = await this.jwtService.signAsync(payload);

    const refreshToken = await this.jwtService.signAsync(payload, {
      secret: this.configService.getOrThrow('JWT_REFRESH_SECRET'),
      expiresIn: this.configService.getOrThrow('JWT_REFRESH_EXPIRES_IN'),
    });

    const refreshHash = await bcrypt.hash(refreshToken, 12);

   if(role === 'BLOOD_BANK') {
    await this.bloodBankRepository.update(account._id || account.id, {
      refreshTokenHash: refreshHash
    });
   } else {
    await this.usersRepository.update(account._id || account.id, {
      refreshTokenHash: refreshHash
    })
   }

    return {
      user: {
        id: account.id || account._id,
        fullName: account.fullName || account.bloodBankName,
        email: account.email,
        role
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
        isVerified: false,
        attempts: 0,
        createdAt: new Date()
      },
      { upsert: true, new: true }
    );

    await this.emailService.sendOtpEmail(email, otp);

    return { message: 'Verification OTP sent successfully to your email.' };
  }

  async verifyOtp(verifyOtpDto: VerifyOtpDto): Promise<{ verified: boolean; message: string }> {
    const email = verifyOtpDto.email.toLowerCase();

    const otpRecord = await this.otpModel.findOne({ email });
    if(!otpRecord) {
      throw new NotFoundException('OTP has expired or was never requested. Please request a new code.');
    }

    const now = new Date().getTime();

    const otpAge = now - new Date(otpRecord.createdAt).getTime();

    if(otpAge > 10 * 60 * 1000) {
      await this.otpModel.deleteOne({ _id: otpRecord._id });
      throw new BadRequestException('OTP has expired. Please request a new one.')
    }

    if(otpRecord.attempts >= 5) {
      await this.otpModel.deleteOne({ _id: otpRecord._id });
      throw new BadRequestException('Too many failed attempts. This OTP has been inivalidated.')
    }

    const isMatch = await bcrypt.compare(verifyOtpDto.otp, otpRecord.otpHash);

    if(!isMatch) {
      await this.otpModel.updateOne({ _id: otpRecord._id }, { $inc: { attempts: 1 } });
      throw new BadRequestException('Invalid OTP code. Please check your email and try again.')
    }

    await this.otpModel.updateOne({ _id: otpRecord._id }, { $set: { isVerified: true } });

    return {
      verified: true,
      message: 'Email verified succesfully.'
    }
  }

  async validateAccountById(id: string, role?: string) {
    let account: any = null;

    if(role === 'BLOOD_BANK') {
      account = await this.bloodBankRepository.findOne(
        { _id: id },
        '+refreshTokenHash',
      );
      if (account) return { account, role: 'BLOOD_BANK' };
    } else {
      account = await this.usersRepository.findOne(
        { _id: id },
        '+refreshTokenHash',
      );

      if (account) return { account, role: account.role || 'USER' };
    }

    account = await this.usersRepository.findOne({ _id: id }, '+refreshTokenHash');
    if (account) return { account, role: account.role || 'USER' };

    account = await this.bloodBankRepository.findOne({ _id: id }, '+refreshTokenHash');
    if (account) return { account, role: 'BLOOD_BANK' };

    throw new UnauthorizedException('Account not found');
  }

  async refreshToken(refreshToken: string) {
    try{
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      });

      const { account, role } = await this.validateAccountById(
        payload.sub,
        payload.role,
      );

      if(!account.refreshTokenHash) {
        throw new UnauthorizedException('Access Denied: No active session');
      }

      const isRefreshTokenValid = await bcrypt.compare(
        refreshToken,
        account.refreshTokenHash,
      )

      if(!isRefreshTokenValid) {
        throw new UnauthorizedException('Access Denied: Invalid refresh token');
      }

      const newPayLoad = {
        sub: account._id || account.id,
        email: account.email,
        role
      };

      const newAccessToken = await this.jwtService.signAsync(newPayLoad);

      const newRefreshToken = await this.jwtService.signAsync(newPayLoad, {
        secret: this.configService.getOrThrow('JWT_REFRESH_SECRET'),
        expiresIn: this.configService.getOrThrow('JWT_REFRESH_EXPIRES_IN'),
      });

      const refreshHash = await bcrypt.hash(newRefreshToken, 12);

      if(role === 'BLOOD_BANK') {
        await this.bloodBankRepository.update(account._id || account.id, {
          refreshTokenHash: refreshHash,
        });
      } else {
        await this.usersRepository.update(account._id || account.id, {
          refreshTokenHash: refreshHash,
        });
      }

      return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
        user: {
          id: account.id || account._id,
          fullname: account.fullName || account.bloodBankName,
          email: account.email,
          role,
        },
      };
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }
}
