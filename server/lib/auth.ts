import { betterAuth } from 'better-auth'
import { prismaAdapter } from 'better-auth/adapters/prisma'
import { emailOTP } from 'better-auth/plugins/email-otp'
import { testUtils } from 'better-auth/plugins'
import prisma from '~~/server/utils/prisma'
import { sendEmail, templateOtp } from '~~/server/utils/email'

const isDev = process.env.NODE_ENV !== 'production'

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: 'sqlite',
  }),
  plugins: [
    testUtils({ captureOTP: true }),
    emailOTP({
      async sendVerificationOTP({ email, otp }) {
        if (isDev) {
          console.log(`\n[DEV] OTP for ${email}: ${otp}\n`)
        }
        await sendEmail(email, 'OTP for UTDesign Procurement', templateOtp(otp))
      },
    }),
  ],
})
export type Auth = typeof auth
