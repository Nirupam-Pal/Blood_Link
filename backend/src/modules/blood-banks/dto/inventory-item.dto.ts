import { IsInt, IsOptional, Min } from "class-validator";

export class InventoryItemDto {
    @IsOptional()
    @IsInt()
    @Min(0)
    units?: number;
}