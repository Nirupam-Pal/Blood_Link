import { Module } from '@nestjs/common';
import { BloodBanksService } from './blood-banks.service';
import { BloodBanksController } from './blood-banks.controller';

@Module({
  providers: [BloodBanksService],
  controllers: [BloodBanksController]
})
export class BloodBanksModule {}
