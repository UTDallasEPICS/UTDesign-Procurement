import { describe, expect, jest, test } from '@jest/globals'
import handler from '@/pages/api/request-form/update'
import mockRequestResponse from '@/lib/mock'

describe('Request Form Update API', () => {
  test('A GET call should return 405', async () => {
    const mockHandler = jest.fn(handler)
    const { req, res } = mockRequestResponse()
    await mockHandler(req, res)
    expect(res.statusCode).toBe(405)
  })

  test('A POST call with an empty body should return 400', async () => {
    const requestBody = {}
    const mockHandler = jest.fn(handler)
    const { req, res } = mockRequestResponse('POST', requestBody)
    await mockHandler(req, res)
    expect(res.statusCode).toBe(400)
  })

  test('A POST call with a valid body should return 200', async () => {
    const mockHandler = jest.fn(handler)
    const requestBody = {
      projectID: 1,
      requestID: 1,
      items: [
        {
          description: 'some item description',
          url: 'someurl.com',
          partNumber: '123456789',
          quantity: 1,
          unitPrice: 0.75,
          vendorID: 1,
        },
        {
          description: 'some item description 2',
          url: 'someurl.com',
          partNumber: '987654321',
          quantity: 1,
          unitPrice: 0.5,
          vendorID: 1,
        },
      ],
      totalExpenses: 1.25,
    }

    const { req, res } = mockRequestResponse('POST', requestBody)
    await mockHandler(req, res)
    expect(res.statusCode).toBe(400)
  })
})
