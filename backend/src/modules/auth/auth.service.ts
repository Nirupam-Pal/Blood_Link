import { Injectable } from '@nestjs/common';
import { UserRepository } from '../users/repositories/users.repository';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
    constructor(
        private readonly userRepository: UserRepository,
        private readonly jwtService: JwtService,
    ) {}
}
