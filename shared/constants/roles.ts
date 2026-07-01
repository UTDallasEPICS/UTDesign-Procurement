export const ROLES = {
  ADMIN: 'ADMIN',
  MENTOR: 'MENTOR',
  STUDENT: 'STUDENT',
} as const

export type Role = (typeof ROLES)[keyof typeof ROLES]

export const ROLE_VALUES = Object.values(ROLES) as Role[]
