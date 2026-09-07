import { betterAuth } from 'better-auth'
import { emailOTP } from 'better-auth/plugins/email-otp'
import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com'
  port: 587,
  secure: false, // use STARTTLS (upgrade connection to TLS after connecting)
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
      async sendVerificationOTP({ email, otp }) {
        await transporter.sendMail({
          from: process.env.NODEMAILER_EMAIL,
          to: email,
          subject: 'OTP for UTDesign-procurement',
          html: `Your OTP is: ${otp}`,
        })
      },
    }),
  ],
})

export type Auth = typeof auth