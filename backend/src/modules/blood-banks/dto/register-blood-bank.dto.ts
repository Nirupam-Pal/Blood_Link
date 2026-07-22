import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsString,
  Length,
  Matches,
  ValidateNested,
} from 'class-validator';
import { GeoJsonPointDto } from './geo-json-point.dto';
import { REGEX_CONSTANTS } from '../../../common/constants/regex.constants';

class LocationDto {
  @ApiProperty({
    example: [-118.2437, 34.0522],
    description: '[Longitude, Latitude]',
  })
  @IsArray()
  @IsNumber({}, { each: true })
  readonly coordinates!: number[];
}

export class RegisterBloodBankDto {
  @ApiProperty({ example: 'Agartala Government Blood Bank' })
  @IsString()
  @IsNotEmpty()
  @Length(3, 100)
  readonly bloodBankName!: string;

  @ApiProperty({ example: 'bloodbank@gmail.com' })
  @IsEmail()
  @IsNotEmpty()
  readonly email!: string;

  @ApiProperty({ example: 'SecureP@ss123' })
  @IsString()
  @IsNotEmpty()
  @Matches(REGEX_CONSTANTS.PASSWORD_POLICY, {
    message:
      'Password must be at least 8 characters long, contain 1 uppercase, 1 lowercase, 1 number, and 1 special character.',
  })
  readonly password!: string;

  @ApiProperty({ example: 'TR-BB-2026-001' })
  @IsString()
  @IsNotEmpty()
  @Length(5, 50)
  readonly licenseNumber!: string;

  @ApiProperty({ example: "9XXXXXXXXX" })
  @Matches(REGEX_CONSTANTS.PHONE_NUMBER, {
    message: "Phone number must be exactly 10 digits.",
  })
  phoneNumber!: string;

  @ApiProperty({
    example: 'GB Pant Hospital Road, Agartala',
  })
  @IsString()
  @IsNotEmpty()
  @Length(5, 250)
  readonly address!: string;

  @ApiProperty({ example: 'Tripura' })
  @IsString()
  @IsNotEmpty()
  readonly state!: string;

  @ApiProperty({ example: 'West Tripura' })
  @IsString()
  @IsNotEmpty()
  readonly district!: string;

  @ApiProperty({ example: 'Sadar' })
  @IsString()
  @IsNotEmpty()
  readonly subDivision!: string;

  @ApiProperty({ example: 'Agartala' })
  @IsString()
  @IsNotEmpty()
  readonly city!: string;

  @ApiProperty({ example: '799001' })
  @IsString()
  @IsNotEmpty()
  @Matches(REGEX_CONSTANTS.PINCODE, {
    message: 'Pincode must be exactly 6 numeric digits.',
  })
  readonly pinCode!: string;;

  @ValidateNested()
  @Type(() => GeoJsonPointDto)
  readonly location!: GeoJsonPointDto;
}
