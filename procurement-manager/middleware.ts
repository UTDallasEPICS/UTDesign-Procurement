/**
 * This is the file that protects unauthorized users from accessing protected routes.
 */
import { getToken } from 'next-auth/jwt'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request })
  const path = request.nextUrl.pathname

  // If user is not logged in, redirect to login page
  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Check role-based access
  if (path.startsWith('/orders/')) {
    const roleID = token.roleID as number
    const userRole = path.split('/')[2] // 'admin', 'mentor', or 'student'

    const hasAccess = (
      (roleID === 3 && userRole === 'admin') ||
      (roleID === 2 && userRole === 'mentor') ||
      (roleID === 1 && userRole === 'student')
    )

    if (!hasAccess) {
      // Redirect to their appropriate dashboard based on role
      let correctPath = '/orders/'
      switch (roleID) {
        case 1: correctPath += 'admin'; break
        case 2: correctPath += 'mentor'; break
        case 3: correctPath += 'student'; break
      }
      return NextResponse.redirect(new URL(correctPath, request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/orders/:path*']
}
