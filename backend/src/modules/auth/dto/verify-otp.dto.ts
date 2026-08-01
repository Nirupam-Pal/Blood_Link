import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, Length, Matches } from 'class-validator';

export class VerifyOtpDto {
  @IsEmail()
  @IsNotEmpty()
  @ApiProperty({ example: 'centralbloodbank@gmail.com' })
  readonly email!: string;

  @ApiProperty({
    example: '849201',
    description: '6-digit numeric OTP sent via email',
  })
  @IsString()
  @IsNotEmpty()
  @Length(6, 6, { message: 'OTP must be exactly 6 digits.' })
  @Matches(/^\d{6}$/, { message: 'OTP must contain only numbers.' })
  readonly otp!: string;
}
