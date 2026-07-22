import { ApiProperty } from "@nestjs/swagger"
import { IsEmail, IsNotEmpty, IsString } from "class-validator"

export class LoginDto {
    @ApiProperty({ example: 'name@gmail.com' })
    @IsEmail()
    @IsNotEmpty()
    readonly email!: string

    @ApiProperty({ example: 'SecureP@ass123' })
    @IsString()
    @IsNotEmpty()
    readonly password!: string
}