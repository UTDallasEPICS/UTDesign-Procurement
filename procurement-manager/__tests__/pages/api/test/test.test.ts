import { describe, test, expect } from '@jest/globals'
import handler from '@/pages/api/test/index'
import mockRequestResponse from '@/lib/mock'

describe('Test API', () => {
  test('A GET call should return 200 when newly setup or 500', async () => {
    const { req, res } = mockRequestResponse()

    await handler(req, res)

    const condition = res.statusCode === 200 || res.statusCode === 500
    expect(condition).toBeTruthy()
  })

  test('A POST call should return 405', async () => {
    const { req, res } = mockRequestResponse('POST')
    await handler(req, res)
    expect(res.statusCode).toBe(405)
  })
})
