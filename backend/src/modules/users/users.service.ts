import { ConflictException, Injectable } from '@nestjs/common';
import { UserRepository } from './repositories/users.repository';
import { RegisterUserDto } from './dto/register-user.dto';
import { Role } from '../../common/enums/role.enum';
import * as bcrypt from 'bcrypt';
import { User } from './user.schema';

@Injectable()
export class UsersService {
  constructor(private readonly userRepository: UserRepository) {}

  async createUsers(
    registerUserDto: RegisterUserDto,
    assignedRole: Role = Role.USER,
  ): Promise<User> {
    const existingUser = await this.userRepository.findOne({
      email: registerUserDto.email,
    });

    if (existingUser) {
      throw new ConflictException(
        'This email is already registered within the ecosystem',
      );
    }

    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(registerUserDto.password, salt);

    const createdUser = await this.userRepository.create({
      ...registerUserDto,
      password: hashedPassword,
      role: assignedRole,
    });

    const res = createdUser.toObject();
    delete res.password;
    return res as User;
  }

  async getUsers(): Promise<User[]> {
    return this.userRepository.findMany()
  }
}
