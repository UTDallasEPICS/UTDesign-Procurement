import mockRequestResponse from '@/lib/mock'
import handler, { createRequest } from '@/pages/api/request-form'
import { describe, expect, jest, test, afterAll } from '@jest/globals'
import { prisma } from '@/db'
import { prismaMock } from '@/singleton'

describe('Request Form API', () => {
  // This was before mocking the database, we needed to delete all the requests created by the tests
  afterAll(async () => {
    // Delete all sample requests
    // await prisma.requestItem.deleteMany({
    //   where: {
    //     AND: [{ url: 'someurl.com' }, { partNumber: '123456789' }],
    //   },
    // })
    // await prisma.process.deleteMany({
    //   where: {
    //     request: {
    //       student: { email: 'abc000000@utdallas.edu' },
    //       project: { projectNum: 1 },
    //       dateNeeded: new Date('2024-01-08'),
    //     },
    //   },
    // })
    // await prisma.request.deleteMany({
    //   where: {
    //     AND: {
    //       student: { email: 'abc000000@utdallas.edu' },
    //       project: { projectNum: 1 },
    //       dateSubmitted: new Date('2024-01-08'),
    //     },
    //   },
    // })
  })

  test('A GET call should return 405', async () => {
    const mockHandler = jest.fn(handler)
    const { req, res } = mockRequestResponse()

    await mockHandler(req, res)

    expect(res.statusCode).toBe(405)
  })

  test('A POST call with an empty body should return 400', async () => {
    const body = {}
    const mockHandler = jest.fn(handler)

    const { req, res } = mockRequestResponse('POST', body)

    await mockHandler(req, res)

    expect(res.statusCode).toBe(400)
  })

  test('A POST call with a valid body should return 200', async () => {
    const mockHandler = jest.fn(handler)

    const requestBody = {
      dateNeeded: '2024-01-08',
      projectNum: 1,
      studentEmail: 'abc000000@utdallas.edu',
      items: [
        {
          description: 'some item description',
          url: 'someurl.com',
          partNumber: '123456789',
          quantity: 1,
          unitPrice: 0.75,
          vendorID: 1,
        },
      ],
      additionalInfo: 'some additional info',
      totalExpenses: 0.75,
    }

    const { req, res } = mockRequestResponse('POST', requestBody)

    await mockHandler(req, res)

    expect(res.statusCode).toBe(200)

    // @ts-ignore
    // prismaMock.request.create.mockResolvedValue(requestBody)

    // await expect(
    //   createRequest(requestBody, new Date('2024-01-12'), {
    //     additionalInfo: requestBody.additionalInfo,
    //   }),
    // ).resolves.toEqual({
    //   dateNeeded: '2024-01-08',
    //   projectNum: 1,
    //   studentEmail: 'abc000000@utdallas.edu',
    // })
  })

  test('A POST call with a body with no items array should return 400', async () => {
    const mockHandler = jest.fn(handler)

    const requestBody = {
      dateNeeded: '2024-01-08',
      projectNum: 1,
      studentEmail: 'abc000000@utdallas.edu',
      items: [
        {
          description: 'some item description',
          url: 'someurl.com',
          partNumber: '123456789',
          quantity: 1,
          unitPrice: 0.75,
          vendorID: 1,
        },
      ],
      additionalInfo: 'some additional info',
      totalExpenses: 0.75,
    }

    const { req, res } = mockRequestResponse('POST', requestBody)

    await mockHandler(req, res)

    expect(res.statusCode).toBe(400)
  })
})
