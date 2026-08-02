import { Module } from '@nestjs/common';
import { BloodBanksService } from './blood-banks.service';
import { BloodBanksController } from './blood-banks.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { BloodBank, BloodBankSchema } from './blood-banks.schema';
import { Otp, OtpSchema } from '../auth/schemas/otp.schema';
import { UsersModule } from '../users/users.module';
import { BloodBanksRepository } from './repositories/blood-banks.repository';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: BloodBank.name, schema: BloodBankSchema },
      { name: Otp.name, schema: OtpSchema }
    ]),
    UsersModule
  ],
  providers: [BloodBanksService, BloodBanksRepository],
  controllers: [BloodBanksController],
  exports: [BloodBanksService, BloodBanksRepository]
})
export class BloodBanksModule {}
