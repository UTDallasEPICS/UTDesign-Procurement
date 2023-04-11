import { NextApiRequest, NextApiResponse } from 'next'
// POST request
// get email, first name, last name from SSO,
// get netID from email

// create user - POST
// only UTDesign users can login, not everyone in UTD can sign in
/**
 * await prisma.user.create({
 * data: { ... }
 * }
 */

// get / auth user - POST
/// use SSO to verify username (netID) and password
/// once SSO gives us like success or something
//// get the user role
//// data = token, user role, basic user info
//// send back data to front end using res
/**
 * Type safe for requesting body
 * https://stackoverflow.com/questions/69893369/how-to-add-typescript-types-to-request-body-in-next-js-api-route/70788003#70788003
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { body } = req
  try {
    if ('role' in body && typeof body.role === 'string') {
      const role: string = req.body.role
      res.status(200).json({ givenRole: role })
    }
  } catch (error) {}
}
