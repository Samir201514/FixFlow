import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsBoolean, IsEnum, IsOptional } from 'class-validator';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto.js';
import { NotificationType } from '../../common/enums/notification-type.enum.js';

export class NotificationQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true' || value === true) return true;
    if (value === 'false' || value === false) return false;
    return value;
  })
  @IsBoolean()
  isRead?: boolean;

  @ApiPropertyOptional({ enum: NotificationType, example: NotificationType.ASSIGNED })
  @IsOptional()
  @IsEnum(NotificationType)
  type?: NotificationType;
}
