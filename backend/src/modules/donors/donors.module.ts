import { Module } from '@nestjs/common';
import { DonorsService } from './donors.service';
import { DonorsController } from './donors.controller';
import { EligibilityService } from './services/eligibility.service';
import { UsersModule } from '../users/users.module';
import { DonorRepository } from './repositories/donor.repository';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from '../users/user.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    UsersModule,
  ],
  providers: [DonorsService, EligibilityService, DonorRepository],
  controllers: [DonorsController],
  exports: [DonorsService, DonorsService],
})
export class DonorsModule {}
