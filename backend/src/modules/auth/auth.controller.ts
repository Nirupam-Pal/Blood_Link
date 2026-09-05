import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { SendOtpDto } from './dto/send-otp.dto';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { Public } from '../../common/decorators/public.decorator';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService){}

    @Post('login')
    login(@Body() loginDto: LoginDto) {
        return this.authService.login(loginDto)
    }

    @Public()
    @Post('send-otp')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Dispatch a 6-digit verification OTP to an email address.' })
    @ApiResponse({ status: 200, description: 'OTP dispatched successfully.' })
    async sendOtp(@Body() sendOtpDto: SendOtpDto) {
        return this.authService.sendOtp(sendOtpDto);
    }
    
    @Public()
    @Post('verify-otp')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Verify the 6-digit OTP code sent via email.' })
    @ApiResponse({ status: 200, description: 'OTP verified successfully.' })
    async verifyOtp(@Body() verifyOtpDto: VerifyOtpDto) {
        return this.authService.verifyOtp(verifyOtpDto)
    }

    @Post('refresh')
    @HttpCode(HttpStatus.OK)
    async refreshToken(@Body() refreshTokenDto : RefreshTokenDto) {
        return this.authService.refreshToken(refreshTokenDto.refreshToken);
    }

}
