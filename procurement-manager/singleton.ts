/**
 * This file creates a mock of the prisma client to use in unit tests
 * We are using singleton since we only use
 * Read more here: https://www.prisma.io/docs/orm/prisma-client/testing/unit-testing
 */

import { PrismaClient } from '@prisma/client'
import { mockDeep, mockReset, DeepMockProxy } from 'jest-mock-extended'

import { prisma } from './db'
import { beforeEach, jest } from '@jest/globals'

jest.mock('./db', () => ({
  __esModule: true,
  prisma: mockDeep<PrismaClient>(),
}))

export const prismaMock = prisma as unknown as DeepMockProxy<PrismaClient>

// beforeEach(() => {
//   mockReset(prismaMock)
// })
