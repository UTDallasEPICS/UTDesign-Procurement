import { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    if (req.method !== 'POST') {
      throw new Error('Method Not Allowed')
    }

    const { files } = req.body

    console.log(files)

    res.status(200).send('Success')
  } catch (error) {
    console.log(error)
    res.status(500).send(error)
  }
}
