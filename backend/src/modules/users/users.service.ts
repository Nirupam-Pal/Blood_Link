import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { UsersRepository } from './repositories/users.repository';
import { RegisterUserDto } from './dto/register-user.dto';
import { Role } from '../../common/enums/role.enum';
import * as bcrypt from 'bcrypt';
import { User } from './user.schema';
import { UpdateUserDto } from './dto/update-user.dto';
import { ClientSession } from 'mongoose';
import { SearchDonorDto } from '../donors/dto/search-donor.dto';

@Injectable()
export class UsersService {
  constructor(private readonly userRepository: UsersRepository) {}

  async createUsers(
    registerUserDto: RegisterUserDto,
    assignedRole: Role = Role.USER,
    session?: ClientSession
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
    },
    session,
  );

    const res = createdUser.toObject();
    delete res.password;
    return res as User;
  }

  async getUsers(): Promise<User[]> {
    return this.userRepository.findMany(
      { isActive: true },
      '-password -refreshTokenHash',
    )
  }

  async getUser(id: string): Promise<User> {
    const user = await this.userRepository.findById(
      id,
      '-password -refreshTokenHash',
    );

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async updateUser(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.userRepository.findById(
      id,
      '-password -refreshTokenHash'
    )

    if(!user) {
      throw new NotFoundException('User not found');
    }

    const updatedUser = await this.userRepository.update(
      id, 
      updateUserDto,
      {
        new: true,
        projection: '-password -refreshTokenHash',
        runValidators: true,
      }
    );

    if(!updatedUser) {
      throw new NotFoundException('User not found')
    }
    
    return updatedUser;
  }

  async deleteUser(id: string): Promise<User> {
    const user = await this.userRepository.findById(
      id,
      '-password -refreshTokenHash'
    )

    if(!user) {
      throw new NotFoundException('User not found');
    }

    const deletedUser = await this.userRepository.delete(id)

    if(!deletedUser) {
      throw new NotFoundException('User not found');
    }

    return deletedUser;
  }
}
