/**
 * This is the file that protects unauthorized users from accessing protected routes.
 */
export { default } from 'next-auth/middleware'

// Add the rest of the protected routes here.
export const config = { matcher: ['/orders/:path*', '/request-form'] }
