import { betterAuth } from 'better-auth'
import { prismaAdapter } from 'better-auth/adapters/prisma'
import { emailOTP } from 'better-auth/plugins/email-otp'
import nodemailer from 'nodemailer'

console.log('AUTH INITIALIZING')
console.log('SMTP email:', process.env.NODEMAILER_EMAIL)
console.log('SMTP password exists:', !!process.env.NODEMAILER_PASSWORD)

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
        console.log('🔥🔥🔥 SEND VERIFICATION OTP CALLED')
        console.log('email:', email)
        console.log('otp:', otp)
        console.log('type:', type)

        try {
          const result = await transporter.sendMail({
            from: process.env.NODEMAILER_EMAIL,
            to: email,
            subject: 'OTP for UTDesign Procurement',
            html: `<h1>Your OTP is: ${otp}</h1>`,
          })

          console.log('✅ EMAIL SENT')
          console.log(result.messageId)
        } catch (error) {
          console.error('❌ NODEMAILER ERROR:', error)
          throw error
        }
      },
    }),
  ],
})

console.log('AUTH INITIALIZED SUCCESSFULLY')

export type Auth = typeof auth
