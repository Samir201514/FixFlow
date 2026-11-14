import { SetMetadata } from '@nestjs/common';

export const AuditEntity = (
  entity: any,
  options?: { loadBefore?: boolean },
): ClassDecorator => SetMetadata('audit-entity', { entity, options });

