/**
 * Hopefully this file helps in setting up the authentication with SSO.
 * I am using this as the fakeauth to help the future developers get started on SSO.
 * Here is the video I used and the documentation of the package:
 * https://www.youtube.com/watch?v=cDWytA0V2kI&t
 * https://next-auth.js.org/getting-started/introduction
 */

import { prisma } from '@/db'
import axios from 'axios'
import NextAuth, { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import { signIn } from 'next-auth/react'
import { User } from '@prisma/client'

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  // Configure one or more authentication providers
  providers: [
    /**
     * I am not sure how to set up SSO, but maybe it can be provided here?
     * https://next-auth.js.org/providers/
     */

    // Example using Credentials Provider
    CredentialsProvider({
      // The name to display on the sign in form (e.g. 'Sign in with...')
      name: 'Credentials',
      // The credentials is used to generate a suitable form on the sign in page.
      // You can specify whatever fields you are expecting to be submitted.
      // e.g. domain, username, password, 2FA token, etc.
      // You can pass any HTML attribute to the <input> tag through the object.
      credentials: {
        // username: { label: 'Username', type: 'text', placeholder: 'jsmith' },
        // password: { label: 'Password', type: 'password' },
        roleID: { label: 'RoleID', type: 'number', placeholder: '1' }, // for fakeauth
      },
      async authorize(credentials, req): Promise<any> {
        // You need to provide your own logic here that takes the credentials
        // submitted and returns either a object representing a user or value
        // that is false/null if the credentials are invalid.
        // e.g. return { id: 1, name: 'J Smith', email: 'jsmith@example.com' }
        // You can also use the `req` object to obtain additional parameters
        // (i.e., the request IP address)

        const { roleID } = credentials as any

        try {
          // const res = await axios.post('http://localhost:3000/api/auth', {
          //   roleID: parseInt(roleID),
          // })
          // const user = await res.data.user
          // if (res.status === 200) return user
          const user = await prisma.user.findFirst({
            where: { roleID: parseInt(roleID) },
          })
          if (user) return user
        } catch (error) {
          console.log(error)
          return null
        }

        return null
      },
    }),
    // ...add more providers here
  ],

  session: {
    strategy: 'jwt',
    maxAge: 7 * 24 * 60 * 60, // 7 days
  },

  pages: {
    signIn: '/login',
  },

  callbacks: {
    // async signIn({ user, account, profile, email, credentials }){

    // }

    async jwt({ token, user }) {
      let res = null
      if (token.email)
        res = await prisma.user.findFirst({
          where: { email: token.email },
        })
      if (res) token.name = await res?.firstName

      user && (token.user = user)

      return token
    },

    async session({ session, token }) {
      if (session.user && token) session.user = token.user as User
      return session
    },
  },
}

export default NextAuth(authOptions)
