import { IsMongoId, IsOptional, IsString, MaxLength } from "class-validator";

export class CreateConnectionRequestDto {
    @IsMongoId()
    donorId?: string;

    @IsOptional()
    @IsString()
    @MaxLength(500)
    message?: string;
}