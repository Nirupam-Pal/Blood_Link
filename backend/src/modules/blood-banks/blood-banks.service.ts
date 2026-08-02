import { BadRequestException, ConflictException, Injectable } from '@nestjs/common';
import { BloodBanksRepository } from './repositories/blood-banks.repository';
import { UsersService } from '../users/users.service';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Otp } from '../auth/schemas/otp.schema';
import { Connection, Model } from 'mongoose';
import { RegisterBloodBankDto } from './dto/register-blood-bank.dto';
import { BloodBank } from './blood-banks.schema';
import { Role } from '../../common/enums/role.enum';
import { Gender } from '../../common/enums/gender.enum';

@Injectable()
export class BloodBanksService {
  constructor(
    private readonly bloodBanksRepository: BloodBanksRepository,
    private readonly userService: UsersService,
    @InjectModel(Otp.name) private readonly otpModel: Model<Otp>,
    @InjectConnection() private readonly connection: Connection,
  ) {}

  async register(registerBloodBankDto: RegisterBloodBankDto): Promise<BloodBank> {
    const verifiedOtp = await this.otpModel.findOne({
        email: registerBloodBankDto.email.toLowerCase(),
        isVerified: true,
    })

    if(!verifiedOtp) {
        throw new BadRequestException(
            'Email verification required. Please request and verify an OTP before registering.'
        );
    }

    const existingLicense = await this.bloodBanksRepository.findOne({
        licenseNumber: registerBloodBankDto.licenseNumber
    });

    if(existingLicense) {
        throw new ConflictException(
            'A Blood Bank with this license number is already registered'
        );
    }

    const session = await this.connection.startSession();
    session.startTransaction();

    try {
        const user = await this.userService.createUsers(
            {
                email: registerBloodBankDto.email,
                password: registerBloodBankDto.password,
                fullName: registerBloodBankDto.bloodBankName,
                gender: Gender.OTHER,
                state: registerBloodBankDto.state,
                district: registerBloodBankDto.district,
                subDivision: registerBloodBankDto.subDivision,
                city: registerBloodBankDto.city,
                pinCode: registerBloodBankDto.pinCode
            },
            Role.BLOOD_BANK,
            session
        );

        const bloodBankData: Partial<BloodBank> = {
            _id: user._id,
            bloodBankName: registerBloodBankDto.bloodBankName,
            licenseNumber: registerBloodBankDto.licenseNumber,
            phoneNumber: registerBloodBankDto.phoneNumber,
            address: registerBloodBankDto.address,
            state: registerBloodBankDto.state,
            district: registerBloodBankDto.district,
            subDivision: registerBloodBankDto.subDivision,
            city: registerBloodBankDto.city,
            pinCode: registerBloodBankDto.pinCode,
            emailVerified: true,
            location: {
                type: 'Point',
                coordinates: registerBloodBankDto.location.coordinates,
            },
        }
        const bloodBank = await this.bloodBanksRepository.create(bloodBankData, session);

        await this.otpModel.deleteOne({ _id: verifiedOtp._id }, { session });

        await session.commitTransaction()
        return bloodBank;
    } catch (error) {
        await session.abortTransaction();
        throw error;
    } finally {
        await session.endSession();
    }
  }
}