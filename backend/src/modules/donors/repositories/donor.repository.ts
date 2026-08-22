import { Injectable } from '@nestjs/common';
import { User } from '../../users/user.schema';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model } from 'mongoose';
import { BaseRepository } from '../../../database/base.repository';
import { SearchDonorDto } from '../dto/search-donor.dto';

@Injectable()
export class DonorRepository extends BaseRepository<User> {
  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<User>,
  ) {
    super(userModel);
  }

  async searchByFilters(filters: SearchDonorDto): Promise<User[]> {
    const escapeRegex = (text: string) =>
      text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');

    const query: FilterQuery<User> = {
      isActive: true,
      isDonor: true,
      state: new RegExp(`^${escapeRegex(filters.state.trim())}$`, 'i'),
    };

    if(filters.bloodGroup) {
      query.bloodGroup = filters.bloodGroup;
    }

    if (filters.district?.trim()) {
      query.district = new RegExp(
        `^${escapeRegex(filters.district.trim())}$`,
        'i',
      );
    }
    if (filters.subDivision?.trim()) {
      query.subDivision = new RegExp(
        `^${escapeRegex(filters.subDivision.trim())}$`,
        'i',
      );
    }
    if (filters.city?.trim()) {
      query.city = new RegExp(`^${escapeRegex(filters.city.trim())}$`, 'i');
    }

    return this.userModel
      .find(query)
      .select('fullName bloodGroup phoneNumber city subDivision district state')
      .exec();
  }
}
