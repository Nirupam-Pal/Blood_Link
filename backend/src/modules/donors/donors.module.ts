import { Module } from '@nestjs/common';
import { DonorsService } from './donors.service';
import { DonorsController } from './donors.controller';
import { EligibilityService } from './services/eligibility.service';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [UsersModule],
  providers: [DonorsService, EligibilityService],
  controllers: [DonorsController],
  exports: [DonorsService]
})
export class DonorsModule {}
