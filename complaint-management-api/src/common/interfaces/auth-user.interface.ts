import { UserRoles } from '../enums/user-roles.enum.js';

export interface AuthUser {
  userId: number;
  email?: string;
  role: UserRoles;
}