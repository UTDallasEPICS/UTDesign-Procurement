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
export default function handler() {}
