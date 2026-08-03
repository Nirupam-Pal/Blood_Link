import { Body, Controller, HttpCode, HttpStatus, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { DonorsService } from './donors.service';
import { CurrentUser } from '../../common/decorators/current-account.decorator';
import type { AuthenticatedUser } from '../../common/types';
import { RegisterDonorDto } from './dto/register-donors.dto';

@ApiTags('Donor System Lifecycle')
@Controller('donors')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class DonorsController {
    constructor(private readonly donorService: DonorsService) {}

    @Post('register')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Evaluate medical eligibility and register authenticated user as a donnor' })
    @ApiResponse({ status: 200, description: 'Evaluation completed successfully' })
    async registerAsDonor(
        @CurrentUser() user: AuthenticatedUser,
        @Body() registerDonorDto: RegisterDonorDto,
    ) {
        const assessmentResult = await this.donorService.processRegistration(user.id, registerDonorDto)

        if(!assessmentResult.eligible) {
            return {
                success: false,
                message: 'Medical eligibility requirements were not met.',
                data: assessmentResult
            }
        }

        return {
            success: true,
            message: 'Clearance granted: User is now registered as an active donor.',
            data: assessmentResult
        }
    }
}
