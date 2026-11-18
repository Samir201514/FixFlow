import { IsString, IsNotEmpty, IsOptional, IsInt, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
export class CreateComplaintAttachmentDto {
    @ApiProperty({ example: 101 })
    @Type(() => Number)
    @IsInt()
    @Min(1)
    complaintId: number;
    @ApiProperty({ description: 'The name of the uploaded file' })
    @IsString()
    @IsNotEmpty()
    fileName: string;
    @ApiProperty({ description: 'The URL or path where the file is stored' })
    @IsString()
    @IsNotEmpty()
    fileUrl: string;
    @ApiPropertyOptional({ description: 'MIME type of the file (e.g., image/png)' })
    @IsString()
    @IsOptional()
    fileType?: string;

}
