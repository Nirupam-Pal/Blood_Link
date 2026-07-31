import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean, IsNotEmpty, IsNumber, Min } from "class-validator";

export class RegisterDonorDto {
    @ApiProperty({ example: 70, description: 'Weight in kilograms (Must be >= 45kg)' })
    @IsNumber()
    @IsNotEmpty()
    @Min(1)
    readonly weight!: number;

    @ApiProperty({ example: false })
    @IsBoolean()
    @IsNotEmpty()
    readonly takingMedication!: boolean;

    @ApiProperty({ example: false })
    @IsBoolean()
    @IsNotEmpty()
    readonly recentTattoo!: boolean;

    @ApiProperty({ example: false })
    @IsBoolean()
    @IsNotEmpty()
    readonly recentSurgery!: boolean;

    @ApiProperty({ example: false })
    @IsBoolean()
    @IsNotEmpty()
    readonly hepatitis!: boolean;

    @ApiProperty({ example: false })
    @IsBoolean()
    @IsNotEmpty()
    readonly hiv!: boolean;

    @ApiProperty({ example: false })
    @IsBoolean()
    @IsNotEmpty()
    readonly diabetes!: boolean;

    @ApiProperty({ example: false })
    @IsBoolean()
    @IsNotEmpty()
    readonly highBloodPressure!: boolean;

    @ApiProperty({ example: false })
    @IsBoolean()
    @IsNotEmpty()
    readonly chronicDisease!: boolean;

    @ApiProperty({ example: true })
    @IsBoolean()
    @IsNotEmpty()
    readonly consentInformation!: boolean;

    @ApiProperty({ example: true })
    @IsBoolean()
    @IsNotEmpty()
    readonly consentContact!: boolean;

    @ApiProperty({ example: true })
    @IsBoolean()
    @IsNotEmpty()
    readonly consentPrivacy!: boolean;
}