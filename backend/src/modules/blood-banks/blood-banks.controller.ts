import { Body, Controller, Get, HttpCode, HttpStatus, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { BloodBanksService } from './blood-banks.service';
import { RegisterBloodBankDto } from './dto/register-blood-bank.dto';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Public } from '../../common/decorators/public.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CurrentBloodBank } from '../../common/decorators/current-account.decorator';
import { BloodBank } from './blood-banks.schema';
import { Role } from '../../common/enums/role.enum';
import { UpdateInventoryItemDto } from './dto/update-inventory-item.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { SearchBloodBankDto } from './dto/search-bloodBank.dto';

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
    
    @Get('search')
    @Roles(Role.USER)
    @ApiBearerAuth()
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Search active blood banks by state and optional filters (Protected)' })
    @ApiResponse({ status: 200, description: 'Matching blood banks retrieved successfully.' })
    @ApiResponse({ status: 401, description: 'Unauthorized: Authentication token missing or invalid.' })
    @ApiResponse({ status: 403, description: 'Forbidden: Requires USER role.' })
    async searchBloodBank(@Query() queryDto: SearchBloodBankDto) {
        const data = await this.bloodBanksService.searchBloodBanks(queryDto);
        
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
}
