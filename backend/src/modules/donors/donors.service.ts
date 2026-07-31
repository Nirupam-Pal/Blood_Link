import { Injectable } from '@nestjs/common';
import { UsersRepository } from '../users/repositories/users.repository';
import {
  EligibilityService,
  IEligibilityResult,
} from './services/eligibility.service';
import { RegisterDonorDto } from './dto/register-donors.dto';

@Injectable()
export class DonorsService {
  constructor(
    private readonly usersRepository: UsersRepository,
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
}
