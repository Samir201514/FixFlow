import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ArrayMaxSize, ArrayUnique, IsArray, IsInt, IsNotEmpty, IsOptional, IsString, MaxLength, Min, } from 'class-validator';
export class CreateComplaintDto {
    @ApiProperty({ example: 'Projector not working' })
    @IsString()
    @IsNotEmpty()
    @MaxLength(150)
    title: string;
    @ApiProperty({ example: 'Room 305 projector shows no signal.' })
    @IsString()
    @IsNotEmpty()
    @MaxLength(2000)
    description: string;
    @ApiProperty({ example: 1 })
    @Type(() => Number)
    @IsInt()
    @Min(1)
    categoryId: number;
    @ApiProperty({ example: 'Building B, Room 305' })
    @IsString()
    @IsNotEmpty()
    @MaxLength(255)
    location: string;
    @ApiPropertyOptional({ type: [Number], example: [1, 2] })
    @IsOptional()
    @IsArray()
    @ArrayUnique()
    @ArrayMaxSize(5)
    @IsInt({ each: true })
    @Min(1, { each: true })
    tagIds?: number[];
}
