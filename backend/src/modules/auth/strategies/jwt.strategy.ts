import { ExtractJwt, Strategy } from 'passport-jwt';
import { UsersRepository } from '../../users/repositories/users.repository';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthenticatedUser, JwtPayload } from '../../../common/types';
import { ConfigService } from '@nestjs/config';
import { BloodBanksRepository } from '../../blood-banks/repositories/blood-banks.repository';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly userRepository: UsersRepository,
    private readonly configService: ConfigService,
    private readonly bloodBankRepository: BloodBanksRepository
) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.getOrThrow<string>('JWT_SECRET'),
    });
  }

  async validate(payload: JwtPayload): Promise<AuthenticatedUser> {
    let account: any = await this.userRepository.findById(payload.sub);

    if (!account) {
      account = await this.bloodBankRepository.findById(payload.sub)
    }

    if(!account) {
      throw new UnauthorizedException('Token account no longer exists.')
    }

    return {
      id: (account._id || account.id).toString(),
      email: account.email,
      role: payload.role || 'USER',
    };
  }
}
