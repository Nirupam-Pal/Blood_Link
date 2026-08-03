import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { BloodBanksRepository } from './repositories/blood-banks.repository';
import { InjectModel } from '@nestjs/mongoose';
import { Otp } from '../auth/schemas/otp.schema';
import { Model } from 'mongoose';
import { RegisterBloodBankDto } from './dto/register-blood-bank.dto';
import { BloodBank } from './blood-banks.schema';
import * as bcrypt from 'bcrypt';
import { UpdateBloodBankDto } from './dto/update-blood-bank.dto';
import { UpdateInventoryItemDto } from './dto/update-inventory-item.dto';

@Injectable()
export class BloodBanksService {
    constructor(
        private readonly bloodBanksRepository: BloodBanksRepository,
        @InjectModel(Otp.name) private readonly otpModel: Model<Otp>,
    ) {}

    async register(registerBloodBankDto: RegisterBloodBankDto): Promise<Omit<BloodBank, 'password'>> {
        const email = registerBloodBankDto.email.toLowerCase();

        const verifiedOtp = await this.otpModel.findOne({
            email,
            isVerified: true
        });

        if(!verifiedOtp) {
            throw new BadRequestException(
                'Email verification required. Please request and verify an OTP before registering'
            )
        }

        const existingEmail = await this.bloodBanksRepository.findOne({ email });
        if(existingEmail) {
            throw new ConflictException('A blood bank with this email is already registered.');
        }

        const existingLicense = await this.bloodBanksRepository.findOne({
            licenseNumber: registerBloodBankDto.licenseNumber
        })
        if(existingLicense) {
            throw new ConflictException('A blood bank with this license number is already registered')
        }

        const salt = await bcrypt.genSalt(12);
        const hashedPassword = await bcrypt.hash(registerBloodBankDto.password, salt);

        const createdBloodBank = await this.bloodBanksRepository.create({
            bloodBankName: registerBloodBankDto.bloodBankName,
            email,
            password: hashedPassword,
            licenseNumber: registerBloodBankDto.licenseNumber,
            phoneNumber: registerBloodBankDto.phoneNumber,
            address: registerBloodBankDto.address,
            state: registerBloodBankDto.state,
            district: registerBloodBankDto.district,
            subDivision: registerBloodBankDto.subDivision,
            city: registerBloodBankDto.city,
            pinCode: registerBloodBankDto.pinCode,
            location: {
                type: 'Point',
                coordinates: registerBloodBankDto.location.coordinates
            },
            emailVerified: true,
            isActive: true
        });

        await this.otpModel.deleteOne({ _id: verifiedOtp._id });

        // Exclude hidden fields from final returned object
        const result = createdBloodBank.toObject();
        delete (result as any).password;
        delete (result as any).refreshTokenHash;

        return result;
    }

    async getBloodBanks(): Promise<BloodBank[]> {
        return this.bloodBanksRepository.findMany(
            { isActive: true },
            '-password -refreshTokenHash'
        )
    }

    async getBloodBank(id: string): Promise<BloodBank> {
        const bloodBank = await this.bloodBanksRepository.findById(
            id,
            '-password -refreshTokenHash'
        );
        if (!bloodBank || !bloodBank.isActive) {
            throw new NotFoundException('Blood Bank record not found or inactive.');
        }
        return bloodBank;
    }

    async updateInventory(
        id: string,
        updateInventoryDto: UpdateInventoryItemDto,
    ): Promise<BloodBank> {
        await this.bloodBanksRepository.findById(id);

        const updatePath = `inventory.${updateInventoryDto.bloodGroup}`

        const updatedBank = await this.bloodBanksRepository.update(id, {
            $set: {
                [updatePath]: {
                    units: updateInventoryDto.units,
                    lastUpdated: new Date()
                }
            }
        });

        if(!updatedBank) {
            throw new NotFoundException('Failed to update inventory.');
        }

        return updatedBank;
    }
}