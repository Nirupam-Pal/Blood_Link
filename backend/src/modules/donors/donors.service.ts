import { BadRequestException, Injectable } from '@nestjs/common';
import { UsersRepository } from '../users/repositories/users.repository';
import {
  EligibilityService,
  IEligibilityResult,
} from './services/eligibility.service';
import { RegisterDonorDto } from './dto/register-donors.dto';
import { SearchBloodBankDto } from '../blood-banks/dto/search-bloodBank.dto';
import { User } from '../users/user.schema';
import { SearchDonorDto } from './dto/search-donor.dto';
import { DonorRepository } from './repositories/donor.repository';

@Injectable()
export class DonorsService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly donorsRepository: DonorRepository,
    private readonly eligibilityService: EligibilityService,
  ) {}

  async processRegistration(
    userId: string,
    registerDonorDto: RegisterDonorDto,
  ): Promise<IEligibilityResult> {
    const evaluation =
      this.eligibilityService.evaluateEligibility(registerDonorDto);

    if (!evaluation.eligible) {
      return evaluation;
    }

    await this.usersRepository.update(userId, { donor: true });

    return { eligible: true, reasons: [] };
  }

  async searchDonors(searchDonorsDto: SearchDonorDto): Promise<User[]> {
    if(!searchDonorsDto.state || !searchDonorsDto.state.trim()) {
      throw new BadRequestException('State parameter is required')
    }

    if(!searchDonorsDto.bloodGroup || !searchDonorsDto.bloodGroup.trim()) {
      throw new BadRequestException('Blood group parameter is required')
    }

    return this.donorsRepository.searDonorByFilters({
      state: searchDonorsDto.state.trim(),
      bloodGroup: searchDonorsDto.bloodGroup.trim() as NonNullable<User['bloodGroup']>,
      city: searchDonorsDto.city?.trim(),
      subDivision: searchDonorsDto.subDivision?.trim(),
      district: searchDonorsDto.district?.trim(),
    })
  }
}
