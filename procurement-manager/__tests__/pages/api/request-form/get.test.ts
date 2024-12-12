import mockRequestResponse from '@/lib/mock'
import handler from '@/pages/api/request-form/get'
import { describe, expect, jest, test } from '@jest/globals'

describe('Request Form GET API', () => {
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

  test('A POST call called by a student should return 200', async () => {
    const mockHandler = jest.fn(handler)

    const { req, res } = mockRequestResponse('POST', { email: 'abc000000@utdallas.edu' })

    await mockHandler(req, res)

    expect(res.statusCode).toBe(200)
  })

  test('A POST call called by a mentor should return 200', async () => {
    const mockHandler = jest.fn(handler)

    const { req, res } = mockRequestResponse('POST', { email: 'def000000@utdallas.edu' })

    await mockHandler(req, res)

    expect(res.statusCode).toBe(200)
  })

  test('A POST call called by an admin should return 200', async () => {
    const mockHandler = jest.fn(handler)

    const { req, res } = mockRequestResponse('POST', { email: 'ghi000000@utdallas.edu' })

    await mockHandler(req, res)

    expect(res.statusCode).toBe(200)
  })
})
