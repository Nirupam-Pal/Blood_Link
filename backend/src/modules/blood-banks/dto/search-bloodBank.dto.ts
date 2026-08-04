import { ApiPropertyOptional } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsNotEmpty, IsOptional, IsString, Length } from "class-validator";

export class SearchBloodBankDto {
    @ApiPropertyOptional({
        example: 'Tripura',
        description: 'State name (Mandatory)'
    })
    @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
    @IsString()
    @IsNotEmpty({ message: 'State filter is required for searching blood banks.' })
    @Length(2, 50, { message: 'City must be between 2 and 100 characters.' })
    readonly state!: string;

    @ApiPropertyOptional({
        example: 'Agartala',
        description: 'City name (optional)'
    })
    @IsOptional()
    @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
    @IsString()
    @Length(2, 50, { message: 'City must be between 2 and 100 characters.' })
    readonly city?: string;

    @ApiPropertyOptional({
        example: 'Sadar',
        description: 'Sub-Division name (optional)'
    })
    @IsOptional()
    @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
    @IsString()
    @Length(2, 50, { message: 'City must be between 2 and 100 characters.' })
    readonly subDivision?: string;

    @ApiPropertyOptional({
        example: 'West Tripura',
        description: 'District name (optional)'
    })
    @IsOptional()
    @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
    @IsString()
    @Length(2, 50, { message: 'City must be between 2 and 100 characters.' })
    readonly district?: string;
}