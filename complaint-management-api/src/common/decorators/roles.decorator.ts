import { SetMetadata } from '@nestjs/common';
import { UserRoles } from '../enums/user-roles.enum.js';

export const Roles = (...roles: UserRoles[]) => SetMetadata('roles', roles);
