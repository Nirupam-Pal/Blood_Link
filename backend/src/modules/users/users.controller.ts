import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { RegisterUserDto } from './dto/register-user.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService){}

    @Post('register-user')
    async registerUser(@Body() registerUserDto: RegisterUserDto) {
        return this.usersService.createUsers(registerUserDto);
    }

    @Get()
    @UseGuards(JwtAuthGuard)
    getUsers() {
        return this.usersService.getUsers();
    }

    @Get(':id')
    @UseGuards(JwtAuthGuard)
    getUser(@Param('id') id: string) {
        return this.usersService.getUser(id);
    }
}
