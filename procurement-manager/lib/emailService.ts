import * as nodemailer from 'nodemailer'

let transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.NODEMAILER_EMAIL,
    pass: process.env.NODEMAILER_PASSWORD,
  },
})

export async function sendEmail(
  to: string,
  subject: string,
  text?: string,
  html?: string,
  attachmentPath?: string,
) {
  const message = {
    from: `Dev_Procurement Manager <${process.env.EMAIL}>`,
    to: to,
    subject: subject,
    text: text,
    html: html,
    attachments: [
      {
        filename: 'report.xlsx',
        path: attachmentPath,
      },
    ],
  }

  transporter.sendMail(message, (err, info) => {
    if (err) {
      console.log(err)
      if (info) console.log(info)
    } else {
    }
  })
}

export default transporter
