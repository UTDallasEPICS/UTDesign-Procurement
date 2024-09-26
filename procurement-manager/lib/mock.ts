import { NextApiRequest, NextApiResponse } from 'next'
import { RequestMethod, createMocks } from 'node-mocks-http'

export default function mockRequestResponse(
  method: RequestMethod = 'GET',
  body?: any,
) {
  const { req, res }: { req: NextApiRequest; res: NextApiResponse } =
    createMocks({
      method,
      body: body ? body : {},
    })

  return { req, res }
}
