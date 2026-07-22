import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty } from "class-validator";

export class SendOtpDto {
    @ApiProperty({ example: 'centralbloodbank@gmail.com' })
    @IsEmail()
    @IsNotEmpty()
    readonly email!: string
}