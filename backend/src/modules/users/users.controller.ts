import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { RegisterUserDto } from './dto/register-user.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { UpdateUserDto } from './dto/update-user.dto';
import { CurrentUser } from '../../common/decorators/current-account.decorator';
import { User } from './user.schema';

@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService){}

    @Post('register-user')
    async registerUser(@Body() registerUserDto: RegisterUserDto) {
        return this.usersService.createUsers(registerUserDto);
    }

    @Get()
    @UseGuards(JwtAuthGuard)
    async getUsers() {
        return this.usersService.getUsers();
    }

    @Get('me')
    @UseGuards(JwtAuthGuard)
    async getUser(
        @CurrentUser() user: User
    ) {
        return this.usersService.getUser(user.id);
    }

    @Put('me')
    @UseGuards(JwtAuthGuard)
    async updateProfile(
        @CurrentUser() user: User,
        @Body() data: UpdateUserDto,
    ){
        return this.usersService.updateUser(user.id, data);
    }

    @Delete('me')
    @UseGuards(JwtAuthGuard)
    async deleteUser(
        @CurrentUser() user: User
    ){
        return this.usersService.deleteUser(user.id);
    }
}