/**
 * API call for the rejection and approval of the student's request
 * Not yet tested 
 */
import { prisma } from '@/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]'
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handle(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'POST') {
    const session = await getServerSession(req, res, authOptions)

    if (!session) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    const { requestID, processID } = req.body;

    try {
      const result = await prisma.request.update({
        where: { requestID: requestID },
        data: { Process: { update: { where: { processID: processID }, data: {status: 'APPROVED'} } } },
      });
      return res.status(200).json({ message: 'Request approved successfully', result });
    } catch (error) {
      console.error('Failed to approve request:', error);
      if (error instanceof Error) {
        return res.status(500).json({ message: 'Failed to approve request', error: error.message });
      } else {
        return res.status(500).send(error);
      }
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
