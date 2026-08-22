import { ApiPropertyOptional } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsEnum, IsNotEmpty, IsOptional, IsString, Length } from "class-validator";
import { BloodGroup } from "../../../common/enums/blood-group.enum";

export class SearchDonorDto {
    @ApiPropertyOptional({
        example: 'Tripura',
        description: 'State name (Mandatory)'
    })
    @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
    @IsString()
    @IsNotEmpty({ message: 'State filter is required for searching donors' })
    @Length(2, 50, { message: 'State must be between 2 to 50 characters.' })
    readonly state!: string;

    @ApiPropertyOptional({
        enum: BloodGroup,
        example: BloodGroup.A_POSITIVE,
        description: 'Blood group filter (optional)'
    })
    @IsOptional()
    @IsEnum(BloodGroup, { message: 'Invalid blood group value.' })
    readonly bloodGroup?: BloodGroup;

    @ApiPropertyOptional({
        example: 'West Tripura',
        description: 'District name (optional)'
    })
    @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
    @IsString()
    @Length(2, 50, { message: 'District must be between 2 to 50 characters.' })
    readonly district?: string;

    @ApiPropertyOptional({
        example: 'Sadar',
        description: 'Sub-Division name (optional)'
    })
    @IsOptional()
    @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
    @IsString()
    @Length(2, 50, { message: 'Sub-Division must be between 2 to 50 characters.' })
    readonly subDivision?: string;
    
    @ApiPropertyOptional({
        example: 'Agartala',
        description: 'City name (optional)'
    })
    @IsOptional()
    @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
    @IsString()
    @Length(2, 50, { message: 'City must be between 2 to 50 characters.' })
    readonly city?: string;
}