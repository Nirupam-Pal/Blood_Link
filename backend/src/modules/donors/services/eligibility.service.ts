import { Injectable } from '@nestjs/common';
import { RegisterDonorDto } from '../dto/register-donors.dto';

export interface IEligibilityResult {
  eligible: boolean;
  reasons: string[];
}

@Injectable()
export class EligibilityService {
  evaluateEligibility(registerDonorDto: RegisterDonorDto): IEligibilityResult {
    const reasons: string[] = [];

    if (registerDonorDto.weight < 45) {
      reasons.push(
        'Weight parameter falls below minimum required threshold of 45kg.',
      );
    }
    if (registerDonorDto.takingMedication) {
      reasons.push('Active medication profile conflicts with safety criteria.');
    }
    if (registerDonorDto.recentTattoo) {
      reasons.push('Recent tattoo session blocks window eligibility.');
    }
    if (registerDonorDto.recentSurgery) {
      reasons.push(
        'Post-operative recovery phase conflicts with hemodynamic stability',
      );
    }
    if (registerDonorDto.hepatitis) {
        reasons.push('Medical risk profile: Viral Hepatitis history')
    }
    if (registerDonorDto.hiv) {
        reasons.push('Medical risk profile: HIV trace indicator');
    }
    if(registerDonorDto.diabetes) {
        reasons.push('Metabolic instability context due to diabetes management.');
    }
    if (registerDonorDto.highBloodPressure) {
        reasons.push('Hypertensive condition detected.');
    }
    if (registerDonorDto.chronicDisease) {
        reasons.push('Systemic risk identifies=d due to chronic disease');
    }
    if(!registerDonorDto.consentContact || !registerDonorDto.consentInformation || !registerDonorDto.consentPrivacy) {
        reasons.push('Ecosystem data usage and privacy consent incomplete.');
    }

    return {
        eligible: reasons.length === 0,
        reasons,
    };
  }
}
