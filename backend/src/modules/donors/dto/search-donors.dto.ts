import { ApiPropertyOptional } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsEnum, IsNotEmpty, IsOptional, isString, IsString, Length } from "class-validator";
import { BloodGroup } from "../../../common/enums/blood-group.enum";

export class SearchDonorDto {
    @ApiPropertyOptional({
        example: 'Tripura',
        description: 'State name (Mandatory)'
    })
    @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
    @IsString()
    @IsNotEmpty({ message: 'State filter is required for searching blood banks.' })
    @Length(2, 50, { message: 'State must be between 2 and 100 characters.' })
    readonly state!: string;

    @ApiPropertyOptional({
        example: BloodGroup.A_POSITIVE,
        description: 'Blood group is mandatory for searching'
    })
    @IsEnum(BloodGroup)
    @Length(2, 10, {message: 'Blood group ,ust be between 2 to 10 characters'})
    readonly bloodGroup!: BloodGroup;

    @ApiPropertyOptional({
        example: 'Agartala',
        description: 'City name (optional)'
    })
    @IsOptional()
    @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
    @IsString()
    @Length(2, 50, { message: 'City must be between 2 to 50 characters.' })
    readonly city?: string;

    @ApiPropertyOptional({
        example: 'Sadar',
        description: 'Sub-Division name (optional)'
    })
    @IsOptional()
    @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
    @IsString()
    @Length(2, 20, { message: 'Sub-Division must be between 2 to 20 characters.' })
    readonly subDivision?: string;

    @ApiPropertyOptional({
        example: 'West Tripura',
        description: 'District name (optional)'
    })
    @IsOptional()
    @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
    @IsString()
    @Length(2, 20, {message: 'District must be between 2 to 20 characters'})
    readonly district?: string;
}