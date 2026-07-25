import { Body, Controller, Post } from '@nestjs/common';
import { UsersService } from './users.service';
import { RegisterUserDto } from './dto/register-user.dto';

@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService){}

    @Post('register-user')
    async registerUser(@Body() registerUserDto: RegisterUserDto) {
        return this.usersService.createUsers(registerUserDto);
    }
}
