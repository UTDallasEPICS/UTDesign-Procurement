import { betterAuth } from 'better-auth'
import { prismaAdapter } from 'better-auth/adapters/prisma'
import { emailOTP } from 'better-auth/plugins/email-otp'
import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.NODEMAILER_EMAIL,
    pass: process.env.NODEMAILER_PASSWORD,
  },
})

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: 'sqlite',
  }),

  plugins: [
    emailOTP({
      async sendVerificationOTP({ email, otp, type }) {

        try {
          const result = await transporter.sendMail({
            from: process.env.NODEMAILER_EMAIL,
            to: email,
            subject: 'OTP for UTDesign Procurement',
            html: `<h1>Your OTP is: ${otp}</h1>`,
          })
        } catch (error) {
          console.error('NODEMAILER ERROR:', error)
          throw error
        }
      },
    }),
  ],
})
export type Auth = typeof auth
