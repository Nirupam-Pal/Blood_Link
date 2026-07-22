import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty } from "class-validator";

export class VerifyOtpDto {
    @IsEmail()
    @IsNotEmpty()
    @ApiProperty({ example: 'centralbloodbank@gmail.com' })
    readonly email!: string
}