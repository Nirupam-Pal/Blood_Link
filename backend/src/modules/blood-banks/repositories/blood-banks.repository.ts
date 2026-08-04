import { Injectable } from '@nestjs/common';
import { BaseRepository } from '../../../database/base.repository';
import { BloodBank } from '../blood-banks.schema';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model } from 'mongoose';
import { SearchBloodBankDto } from '../dto/search-bloodBank.dto';

@Injectable()
export class BloodBanksRepository extends BaseRepository<BloodBank> {
  constructor(
    @InjectModel(BloodBank.name)
    private readonly bloodBankModel: Model<BloodBank>,
  ) {
    super(bloodBankModel);
  }

  async searchByFilters(filters: SearchBloodBankDto): Promise<BloodBank[]> {
    const escapeRegex = (text: string) =>
      text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');

    const query: FilterQuery<BloodBank> = {
      isActive: true,
      state: new RegExp(`^${escapeRegex(filters.state.trim())}$`, 'i'),
    };

    if (filters.district?.trim()) {
      query.district = new RegExp(`^${escapeRegex(filters.district.trim())}$`, 'i');
    }
    if (filters.subDivision?.trim()) {
      query.subDivision = new RegExp(`^${escapeRegex(filters.subDivision.trim())}$`, 'i');
    }
    if (filters.city?.trim()) {
      query.city = new RegExp(`^${escapeRegex(filters.city.trim())}$`, 'i');
    }

    return this.bloodBankModel
      .find(query)
      .select('-password -refreshTokenHash')
      .exec();
  }
}
