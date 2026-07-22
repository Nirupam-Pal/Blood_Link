import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsNotEmpty, IsString, Length, Matches } from 'class-validator';
import { REGEX_CONSTANTS } from '../../../common/constants/regex.constants';
import { Gender } from '../../../common/enums/gender.enum';

export class RegisterUserDto {
  @ApiProperty({ example: 'email@gmail.com' })
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

  @ApiProperty({ example: 'John Doe' })
  @IsNotEmpty()
  @IsString()
  @Length(2, 50)
  readonly fullName!: string;

  @ApiProperty({ enum: Gender, example: Gender.MALE })
  @IsEnum(Gender)
  @IsNotEmpty()
  readonly gender!: string

  @ApiProperty({ example: 'Tripura' })
  @IsString()
  @IsNotEmpty()
  readonly state!: string;

  @ApiProperty({ example: 'Sepahijala' })
  @IsString()
  @IsNotEmpty()
  readonly district!: string;

  @ApiProperty({ example: 'Sonamura' })
  @IsString()
  @IsNotEmpty()
  readonly subDivision!: string;

  @ApiProperty({ example: 'Melaghar' })
  @IsString()
  @IsNotEmpty()
  readonly city!: string;

  @ApiProperty({ example: '799115' })
  @IsString()
  @IsNotEmpty()
  @Matches(REGEX_CONSTANTS.PINCODE, { message: 'Pincode must be exactly 6 numeric digits.' })
  readonly pinCode!: string
}
