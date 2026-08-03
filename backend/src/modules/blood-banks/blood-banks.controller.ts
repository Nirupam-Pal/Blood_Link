import { Body, Controller, Get, HttpCode, HttpStatus, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { BloodBanksService } from './blood-banks.service';
import { RegisterBloodBankDto } from './dto/register-blood-bank.dto';
import { ApiOkResponse, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Public } from '../../common/decorators/public.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CurrentBloodBank } from '../../common/decorators/current-account.decorator';
import { BloodBank } from './blood-banks.schema';

@Controller('blood-banks')
@UseGuards(JwtAuthGuard, RolesGuard)
export class BloodBanksController {
    constructor(private readonly bloodBanksService: BloodBanksService) {}

    @Public()
    @Post('register')
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({ summary: 'Register a new verified Blood Bank facility' })
    @ApiResponse({ status: 201, description: 'Blood Bank registered sucessfully' })
    @ApiResponse({ status: 400, description: 'Email OTP verification pending or invalid inout' })
    @ApiResponse({ status: 409, description: 'License number o email already exixts' })
    async registerBloodBank(@Body() registerBloodBankDto: RegisterBloodBankDto) {
        const data = await this.bloodBanksService.register(registerBloodBankDto);

        return {
            message: 'BloodBank facility registered successfully',
            data,
        }
    }

    @Get()
    async getBloodbanks() {
        return this.bloodBanksService.getBloodBanks();
    }

    @Get('me')
    async getBloodBank(
        @CurrentBloodBank() bloodBank: BloodBank
    ) {
        return this.bloodBanksService.getBloodBank(bloodBank.id);
    }
}
