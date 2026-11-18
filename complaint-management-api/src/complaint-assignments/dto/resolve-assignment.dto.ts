import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Length } from 'class-validator';
export class ResolveAssignmentDto {
    
    @ApiProperty({ example: 'Cable replaced and the projector tested' })
    @IsString()
    @IsNotEmpty()
    @Length(5, 1000)
    resolutionNote: string;
}
