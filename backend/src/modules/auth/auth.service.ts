import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserRepository } from '../users/repositories/users.repository';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersRepository: UserRepository,
    private readonly jwtService: JwtService,
  ) {}

  async login(loginDto: LoginDto) {
    const user = await this.usersRepository.findOne(
        { email: loginDto.email }, 
        '+password +refreshTokenHash',
    );

    if(!user) {
        throw new UnauthorizedException('Invalid credentials')
    }

    const isPasswordValid = await bcrypt.compare(
        loginDto.password,
        user.password
    )

    if(!isPasswordValid) {
        throw new UnauthorizedException('Invalid Credentials');
    }

    const payload = {
        sub: user.id,
        email: user.email,
        role: user.role
    };

    const accessToken = await this.jwtService.signAsync(payload);

    const refreshToken = await this.jwtService.signAsync(payload as any, {
      secret: process.env.JWT_REFRESH_SECRET as any,
      expiresIn: process.env.JWT_REFRESH_EXPIRES_IN as any,
    } as any);

    const refreshHash = await bcrypt.hash(refreshToken, 12);

    await this.usersRepository.update(user.id, {
        refreshTokenHash: refreshHash,
    });

    const result = user.toObject();

    delete result.password;
    delete result.refreshTokenHash;

    return {
        user: result,
        accessToken,
        refreshToken,
    }
    
  }
}
