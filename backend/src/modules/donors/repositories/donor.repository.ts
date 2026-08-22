import { Injectable } from '@nestjs/common';
import { User } from '../../users/user.schema';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model } from 'mongoose';
import { SearchDonorDto } from '../dto/search-donor.dto';
import { BaseRepository } from '../../../database/base.repository';

@Injectable()
export class DonorRepository extends BaseRepository<User> {
  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<User>,
  ) {
    super(userModel);
  }

  async searDonorByFilters(filters: SearchDonorDto): Promise<User[]> {
    const escapeRegex = (text: string) =>
      text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');

    const query: FilterQuery<User> = {
        isActive: true,
        donor: true,
        state: new RegExp(`^${escapeRegex(filters.state.trim())}$`, 'i'),
        bloodGroup: new RegExp(`^${escapeRegex(filters.bloodGroup.trim())}$`, 'i')
    };

    if(filters.city?.trim()) {
        query.city = new RegExp(`^${escapeRegex(filters.city.trim())}$`, 'i')
    }
    if(filters.subDivision?.trim()) {
        query.subDivision = new RegExp(`^${escapeRegex(filters.subDivision.trim())}$`, 'i')
    }
    if(filters.district?.trim()) {
        query.district = new RegExp(`^${escapeRegex(filters.district.trim())}$`, 'i')
    }

    return this.userModel
        .find(query)
        .select('-password -refreshTokenHash')
        .exec();
  }
}
