/**
 * API call for the rejection and approval of the student's request
 * Not yet tested 
 */
import { prisma } from '@/db';
import { getSession } from 'next-auth/react';

export default async function handle(req, res) {
  if (req.method === 'POST') {
    const session = await getSession({ req });

    if (!session) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    const { requestID } = req.body;

    try {
      const result = await prisma.request.update({
        where: { requestID: requestID },
        data: { Process: { update: { status: 'APPROVED' } } },
      });
      return res.status(200).json({ message: 'Request approved successfully', result });
    } catch (error) {
      console.error('Failed to approve request:', error);
      return res.status(500).json({ message: 'Failed to approve request', error: error.message });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}