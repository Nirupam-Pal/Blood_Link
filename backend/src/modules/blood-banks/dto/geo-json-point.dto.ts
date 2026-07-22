import { Type } from "class-transformer";
import { ArrayMaxSize, ArrayMinSize, IsArray, IsIn } from "class-validator";

export class GeoJsonPointDto {
    @IsIn(['Point'])
    type!: 'Point'

    @IsArray()
    @ArrayMinSize(2)
    @ArrayMaxSize(2)
    @Type(() => Number)
    coordinates!: number[];
}