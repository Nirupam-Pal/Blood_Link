import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { DonorsService } from './donors.service';
import { CurrentUser } from '../../common/decorators/current-account.decorator';
import type { AuthenticatedUser } from '../../common/types';
import { RegisterDonorDto } from './dto/register-donors.dto';
import { SearchDonorDto } from './dto/search-donor.dto';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('Donor System Lifecycle')
@Controller('donors')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class DonorsController {
  constructor(private readonly donorService: DonorsService) {}

  @Post('register')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary:
      'Evaluate medical eligibility and register authenticated user as a donnor',
  })
  @ApiResponse({
    status: 200,
    description: 'Evaluation completed successfully',
  })
  async registerAsDonor(
    @CurrentUser() user: AuthenticatedUser,
    @Body() registerDonorDto: RegisterDonorDto,
  ) {
    const assessmentResult = await this.donorService.processRegistration(
      user.id,
      registerDonorDto,
    );

    if (!assessmentResult.eligible) {
      return {
        success: false,
        message: 'Medical eligibility requirements were not met.',
        data: assessmentResult,
      };
    }

    return {
      success: true,
      message: 'Clearance granted: User is now registered as an active donor.',
      data: assessmentResult,
    };
  }

  @Public()
  @Get('active')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get all active and eligible donors'
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Return list of all active verified donors'
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Internal server error while retreiving donors.'
  })
  async getAllAvailableDonors() {
    return this.donorService.getDonors();
  }

  @Get('search')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary:
      'Search available donors by filters(State, Blood Group, City, District, Sub Division)',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Returns list of matching verified active donors.',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Validation failed on mandatory filters (state).',
  })
  async searchDonors(@Query() searchDonorDto: SearchDonorDto) {
    return this.donorService.searchDonor(searchDonorDto);
  }
}
