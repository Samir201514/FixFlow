import { IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateComplaintAttachmentDto {
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