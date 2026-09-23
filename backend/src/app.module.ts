import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { DonorsModule } from './modules/donors/donors.module';
import { BloodBanksModule } from './modules/blood-banks/blood-banks.module';
import { ConnectionRequestsModule } from './modules/connection-requests/connection-requests.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        uri: config.getOrThrow<string>('MONGO_URL'),
      }),
    }),
    AuthModule,
    UsersModule,
    DonorsModule,
    BloodBanksModule,
    ConnectionRequestsModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
