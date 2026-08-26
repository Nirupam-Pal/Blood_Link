import { BadRequestException, Injectable } from '@nestjs/common';
import { UsersRepository } from '../users/repositories/users.repository';
import {
  EligibilityService,
  IEligibilityResult,
} from './services/eligibility.service';
import { RegisterDonorDto } from './dto/register-donors.dto';
import { User } from '../users/user.schema';
import { SearchDonorDto } from './dto/search-donor.dto';
import { DonorRepository } from './repositories/donor.repository';
import { BloodGroup } from '../../common/enums/blood-group.enum';

@Injectable()
export class DonorsService {
  constructor(
    private readonly donorsRepository: DonorRepository,
    private readonly usersRepository: UsersRepository,
    private readonly eligibilityService: EligibilityService
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

  async getDonors(): Promise<User[]> {
    return this.donorsRepository.findAllActiveDonors();
  }

  async searchDonor(searchDonorDto: SearchDonorDto): Promise<User[]> {
    if (!searchDonorDto.state || !searchDonorDto.state.trim()) {
      throw new BadRequestException('State parameter is required');
    }

    return this.donorsRepository.searchByFilters({
      state: searchDonorDto.state.trim(),
      city: searchDonorDto.city?.trim(),
      subDivision: searchDonorDto.subDivision?.trim(),
      district: searchDonorDto.district?.trim(),
      bloodGroup: searchDonorDto.bloodGroup?.trim() as BloodGroup,
    });
  }
}
