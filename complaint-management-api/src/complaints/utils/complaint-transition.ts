import { ConflictException, ForbiddenException } from '@nestjs/common';
import { ComplaintStatus } from '../enums/complaint-status.enum.js';
import { UserRoles as Role } from '../../common/enums/user-roles.enum.js';

const S = ComplaintStatus;

const transitions: Partial<
  Record<ComplaintStatus, Partial<Record<ComplaintStatus, Role[]>>>
> = {
  [S.SUBMITTED]: { [S.UNDER_REVIEW]: [Role.ADMIN] },
  [S.UNDER_REVIEW]: { [S.ASSIGNED]: [Role.ADMIN] },
  [S.ASSIGNED]: {
    [S.ASSIGNED]: [Role.ADMIN],
    [S.IN_PROGRESS]: [Role.STAFF],
    [S.UNDER_REVIEW]: [Role.STAFF],
  },
  [S.IN_PROGRESS]: {
    [S.ASSIGNED]: [Role.ADMIN],
    [S.RESOLVED]: [Role.STAFF],
  },
  [S.RESOLVED]: {
    [S.CLOSED]: [Role.USER],
    [S.REOPENED]: [Role.USER],
  },
  [S.REOPENED]: { [S.UNDER_REVIEW]: [Role.ADMIN] },
};

export function assertTransition(
  from: ComplaintStatus,
  to: ComplaintStatus,
  role: Role,
): void {
  const allowedRoles = transitions[from]?.[to];
  if (!allowedRoles) {
    throw new ConflictException(`Cannot change status from ${from} to ${to}`);
  }
  if (!allowedRoles.includes(role)) {
    throw new ForbiddenException(
      `${role} cannot change status from ${from} to ${to}`,
    );
  }
}