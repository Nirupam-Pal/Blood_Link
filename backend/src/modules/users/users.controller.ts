import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { RegisterUserDto } from './dto/register-user.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { UpdateUserDto } from './dto/update-user.dto';

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

    @Get(':id')
    @UseGuards(JwtAuthGuard)
    async getUser(@Param('id') id: string) {
        return this.usersService.getUser(id);
    }

    @Put(':id')
    @UseGuards(JwtAuthGuard)
    async updateUser(
        @Param('id') id: string,
        @Body() data: UpdateUserDto
    ){
        return this.usersService.updateUser(id, data)
    }

    @Delete(':id')
    @UseGuards(JwtAuthGuard)
    async deleteUser(
        @Param('id') id: string
    ){
        return this.usersService.deleteUser(id)
    }
}
