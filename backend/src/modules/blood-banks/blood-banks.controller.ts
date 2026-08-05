import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { BloodBanksService } from './blood-banks.service';
import { RegisterBloodBankDto } from './dto/register-blood-bank.dto';
import { ApiBearerAuth, ApiBody, ApiOkResponse, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Public } from '../../common/decorators/public.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CurrentBloodBank } from '../../common/decorators/current-account.decorator';
import { BloodBank } from './blood-banks.schema';
import { Role } from '../../common/enums/role.enum';
import { UpdateInventoryItemDto } from './dto/update-inventory-item.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { SearchBloodBankDto } from './dto/search-bloodBank.dto';
import { UpdateBloodBankDto } from './dto/update-blood-bank.dto';

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

    @Get('profile')
    async getBloodBank(
        @CurrentBloodBank() bloodBank: BloodBank
    ) {
        return this.bloodBanksService.getBloodBank(bloodBank.id);
    }
    
    @Post('search')
    @Roles(Role.USER)
    @ApiBearerAuth()
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Search active blood banks by state and optional filters (Protected)' })
    @ApiBody({ type: SearchBloodBankDto })
    @ApiResponse({ status: 200, description: 'Matching blood banks retrieved successfully.' })
    @ApiResponse({ status: 401, description: 'Unauthorized: Authentication token missing or invalid.' })
    @ApiResponse({ status: 403, description: 'Forbidden: Requires USER role.' })
    async searchBloodBank(@Body() searchDto: SearchBloodBankDto) {
        const data = await this.bloodBanksService.searchBloodBanks(searchDto);
        
        return {
            message: 'Blood Bank search results retrieved successfully.',
            count: data.length,
            data
        }
    }

    @Get(':id')
    async getBloodBankById(@Param('id') id: string) {
        return this.bloodBanksService.getBloodBank(id)
    }
    
    @Patch('inventory')
    async updateInventory(
        @CurrentBloodBank('id') id: string,
        @Body() updateInventoryDto: UpdateInventoryItemDto,
    ) {
        const data = await this.bloodBanksService.updateInventory(id, updateInventoryDto)
    
        return {
            message: `Inventory units updated successfully for blood group ${updateInventoryDto.bloodGroup}`,
            data
        }
    }

    @Patch('profile')
    @Roles(Role.BLOOD_BANK)
    async updateProfile(
        @CurrentBloodBank('id') bankId: string,
        @Body() updateDto: UpdateBloodBankDto,
    ) {
        const data = await this.bloodBanksService.updateProfile(bankId, updateDto);

        return {
            message: 'Blood Bank profile updated successfully,',
            data
        };
    }

    @Delete('profile')
    @Roles(Role.BLOOD_BANK)
    async deleteProfile(
        @CurrentBloodBank('id') bankId: string
    ) {
        await this.bloodBanksService.deleteProfile(bankId);

        return {
            message: 'Blood bank account deleted successfully'
        }
    }
}
