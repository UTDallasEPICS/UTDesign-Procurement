import type { ProcessStatus } from '@prisma/client'
import type { Role } from '~/shared/constants/roles'

export type OrderKind = 'request' | 'reimbursement'

type TransitionMap = Partial<Record<ProcessStatus, ProcessStatus[]>>

/**
 * Allowed status transitions per role, keyed by the process's current status.
 * Any (role, from, to) combination not listed here is rejected server-side.
 */
const TRANSITIONS: Record<Role, Record<OrderKind, TransitionMap>> = {
  ADMIN: {
    request: {
      APPROVED: ['ORDERED', 'CHANGES_REQUESTED', 'REJECTED'],
      ORDERED: ['RECEIVED'],
    },
    reimbursement: {
      APPROVED: ['PROCESSED', 'CHANGES_REQUESTED', 'REJECTED'],
    },
  },
  MENTOR: {
    request: {
      UNDER_REVIEW: ['APPROVED', 'CHANGES_REQUESTED', 'REJECTED'],
    },
    reimbursement: {
      UNDER_REVIEW: ['APPROVED', 'CHANGES_REQUESTED', 'REJECTED'],
    },
  },
  STUDENT: {
    request: {
      UNDER_REVIEW: ['CANCELLED'],
      CHANGES_REQUESTED: ['UNDER_REVIEW'],
      REJECTED: ['UNDER_REVIEW'],
    },
    reimbursement: {
      UNDER_REVIEW: ['CANCELLED'],
      CHANGES_REQUESTED: ['UNDER_REVIEW'],
      REJECTED: ['UNDER_REVIEW'],
    },
  },
}

export function isTransitionAllowed(
  role: Role,
  kind: OrderKind,
  from: ProcessStatus,
  to: ProcessStatus,
): boolean {
  return TRANSITIONS[role]?.[kind]?.[from]?.includes(to) ?? false
}

/** Transitions that require a non-empty comment explaining the decision. */
export const COMMENT_REQUIRED_STATUSES: ProcessStatus[] = ['CHANGES_REQUESTED', 'REJECTED']
