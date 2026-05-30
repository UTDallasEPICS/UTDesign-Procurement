import { betterAuth } from 'better-auth'
import { prismaAdapter } from 'better-auth/adapters/prisma'
import { prisma } from './prisma'
import { emailOTP } from 'better-auth/plugins/email-otp'
import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: 587,
  secure: false, // use STARTTLS
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
})

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: 'sqlite',
  }),
  plugins: [
    emailOTP({
      async sendVerificationOTP({ email, otp, type }) {
        if (!email.endsWith('@utdallas.edu')) {
          throw new Error('Only @utdallas.edu email addresses are allowed.')
        }
        await transporter.sendMail({
          from: process.env.EMAIL_FROM,
          to: email,
          subject: 'Your login OTP',
          html: `<p>Your OTP is: <strong>${otp}</strong></p><p>This code expires in 10 minutes.</p>`,
        })
      },
    }),
  ],
})
