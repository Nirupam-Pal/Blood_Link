import { IsArray, IsEnum, IsInt, IsNotEmpty, IsOptional, Min, ValidateNested } from "class-validator";
import { BloodGroup } from "../../../common/enums/blood-group.enum";
import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";

export class UpdateInventoryItemDto {
    @ApiProperty({ enum: BloodGroup, example: BloodGroup.A_POSITIVE })
    @IsEnum(BloodGroup)
    @IsNotEmpty()
    readonly bloodGroup!: BloodGroup;

    @ApiProperty({ example: 15, description: 'Number of available units' })
    @IsNotEmpty()
    @IsInt()
    @Min(0, { message: 'Units cannot be negative.' })
    units!: number;
}

export class BatchUpdateInventoryDto {
    @ApiProperty({ type: [UpdateInventoryItemDto] })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => UpdateInventoryItemDto)
    readonly items!: UpdateInventoryItemDto[];
}