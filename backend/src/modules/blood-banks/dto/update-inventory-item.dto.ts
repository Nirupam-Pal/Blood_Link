import { IsEnum, IsInt, IsNotEmpty, IsOptional, Min } from "class-validator";
import { BloodGroup } from "../../../common/enums/blood-group.enum";
import { ApiProperty } from "@nestjs/swagger";

export class UpdateInventoryItemDto {
    @ApiProperty({ enum: BloodGroup, example: BloodGroup.A_POSITIVE })
    @IsEnum(BloodGroup)
    @IsNotEmpty()
    readonly bloodGroup!: BloodGroup;

    @ApiProperty({ example: 15, description: 'Total available units for this blood group' })
    @IsNotEmpty()
    @IsInt()
    @Min(0, { message: 'Units cannot be negative.' })
    units?: number;
}