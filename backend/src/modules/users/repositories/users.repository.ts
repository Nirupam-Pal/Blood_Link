import { Injectable } from '@nestjs/common';
import { BaseRepository } from '../../../database/base.repository';
import { InjectModel } from '@nestjs/mongoose';
import { User } from '../user.schema';
import { FilterQuery, Model } from 'mongoose';
import { SearchDonorDto } from '../dto/search-donor.dto';

@Injectable()
export class UsersRepository extends BaseRepository<User> {
  constructor(@InjectModel(User.name) private readonly userModel: Model<User>) {
    super(userModel);
  }

  async findWithPassword(email: string): Promise<User | null> {
    return this.userModel
      .findOne({ email, isActive: true })
      .select('+password')
      .exec();
  }

  async findWithRefreshToken(id: string): Promise<User | null> {
    return this.userModel.findById(id).select('+refreshTokenHash').exec();
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
