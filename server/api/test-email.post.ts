import nodemailer from 'nodemailer'

export default defineEventHandler(async () => {
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
      user: process.env.NODEMAILER_EMAIL,
      pass: process.env.NODEMAILER_PASSWORD,
    },
  })

  const emailTemplates = {
  emailOtp: {
    subject: 'Verify Your Email Address',
    text: `
Hello {{name}},

Use the following one-time password to verify your email address:

{{otp}}

This code will expire in {{expiration}} minutes.

If you did not request this code, you can safely ignore this email.

Thank you,
{{appName}} Team
    `,
    html: `
<h2>Verify Your Email</h2>

<p>Hello {{name}},</p>

<p>Use the following one-time password to verify your email address:</p>

<h1>{{otp}}</h1>

<p>This code will expire in {{expiration}} minutes.</p>

<p>If you did not request this code, you can safely ignore this email.</p>

<p>Thank you,<br>
{{appName}} Team</p>
    `,
  },

  requestApprovedByMentor: {
    subject: 'Request Approved by Mentor',
    text: `
Hello {{name}},

Your request has been reviewed and approved by your mentor.

Request: {{requestName}}
Request ID: {{requestId}}

Your request will now proceed to the next stage of the approval process.

You can view the request and its current status from your dashboard.

Thank you,
{{appName}} Team
    `,
    html: `
<h2>Request Approved</h2>

<p>Hello {{name}},</p>

<p>Your request has been reviewed and <strong>approved by your mentor</strong>.</p>

<p><strong>Request:</strong> {{requestName}}</p>
<p><strong>Request ID:</strong> {{requestId}}</p>

<p>Your request will now proceed to the next stage of the approval process.</p>

<p>You can view the request and its current status from your dashboard.</p>

<p>Thank you,<br>
{{appName}} Team</p>
    `,
  },

  changesRequested: {
    subject: 'Changes Requested to Your Request',
    text: `
Hello {{name}},

Your request has been reviewed, and changes are required before it can be approved.

Request: {{requestName}}
Request ID: {{requestId}}

Feedback:
{{feedback}}

Please review the requested changes and update your request accordingly.

You can view and edit your request from your dashboard.

Thank you,
{{appName}} Team
    `,
    html: `
<h2>Changes Requested</h2>

<p>Hello {{name}},</p>

<p>Your request has been reviewed, and <strong>changes are required</strong> before it can be approved.</p>

<p><strong>Request:</strong> {{requestName}}</p>
<p><strong>Request ID:</strong> {{requestId}}</p>

<p><strong>Feedback:</strong></p>

<blockquote>
  {{feedback}}
</blockquote>

<p>Please review the requested changes and update your request accordingly.</p>

<p>You can view and edit your request from your dashboard.</p>

<p>Thank you,<br>
{{appName}} Team</p>
    `,
  },

  reimbursementApproved: {
    subject: 'Reimbursement Approved',
    text: `
Hello {{name}},

Your reimbursement request has been approved.

Request: {{requestName}}
Request ID: {{requestId}}
Amount: {{amount}}

Your reimbursement will now proceed to the next stage of processing.

You can view the reimbursement details from your dashboard.

Thank you,
{{appName}} Team
    `,
    html: `
<h2>Reimbursement Approved</h2>

<p>Hello {{name}},</p>

<p>Your reimbursement request has been <strong>approved</strong>.</p>

<p><strong>Request:</strong> {{requestName}}</p>
<p><strong>Request ID:</strong> {{requestId}}</p>
<p><strong>Amount:</strong> {{amount}}</p>

<p>Your reimbursement will now proceed to the next stage of processing.</p>

<p>You can view the reimbursement details from your dashboard.</p>

<p>Thank you,<br>
{{appName}} Team</p>
    `,
  },

  requestRejectedByMentor: {
    subject: 'Request Rejected by Mentor',
    text: `
Hello {{name}},

Your request has been reviewed and rejected by your mentor.

Request: {{requestName}}
Request ID: {{requestId}}

Reason:
{{reason}}

Please review the feedback provided and contact your mentor if you have any questions.

Thank you,
{{appName}} Team
    `,
    html: `
<h2>Request Rejected</h2>

<p>Hello {{name}},</p>

<p>Your request has been reviewed and <strong>rejected by your mentor</strong>.</p>

<p><strong>Request:</strong> {{requestName}}</p>
<p><strong>Request ID:</strong> {{requestId}}</p>

<p><strong>Reason:</strong></p>

<blockquote>
  {{reason}}
</blockquote>

<p>Please review the feedback provided and contact your mentor if you have any questions.</p>

<p>Thank you,<br>
{{appName}} Team</p>
    `,
  },

  requestOrdered: {
    subject: 'Request Marked as Ordered',
    text: `
Hello {{name}},

Good news! Your request has been marked as ordered.

Request: {{requestName}}
Request ID: {{requestId}}

The requested item(s) have been submitted for purchase.

You can view the current status and details of your request from your dashboard.

Thank you,
{{appName}} Team
    `,
    html: `
<h2>Request Ordered</h2>

<p>Hello {{name}},</p>

<p>Good news! Your request has been <strong>marked as ordered</strong>.</p>

<p><strong>Request:</strong> {{requestName}}</p>
<p><strong>Request ID:</strong> {{requestId}}</p>

<p>The requested item(s) have been submitted for purchase.</p>

<p>You can view the current status and details of your request from your dashboard.</p>

<p>Thank you,<br>
{{appName}} Team</p>
    `,
  },

  requestRejectedByAdmin: {
    subject: 'Request Rejected by Administrator',
    text: `
Hello {{name}},

Your request has been reviewed and rejected by an administrator.

Request: {{requestName}}
Request ID: {{requestId}}

Reason:
{{reason}}

Please review the provided reason for more information regarding the decision.

If you believe this decision was made in error, please contact your administrator.

Thank you,
{{appName}} Team
    `,
    html: `
<h2>Request Rejected</h2>

<p>Hello {{name}},</p>

<p>Your request has been reviewed and <strong>rejected by an administrator</strong>.</p>

<p><strong>Request:</strong> {{requestName}}</p>
<p><strong>Request ID:</strong> {{requestId}}</p>

<p><strong>Reason:</strong></p>

<blockquote>
  {{reason}}
</blockquote>

<p>Please review the provided reason for more information regarding the decision.</p>

<p>If you believe this decision was made in error, please contact your administrator.</p>

<p>Thank you,<br>
{{appName}} Team</p>
    `,
  },
}


  const info = await transporter.sendMail({
    from: process.env.NODEMAILER_EMAIL,
    to: 'example@example.com',
    subject: 'Nuxt test email',
    text: 'This is a test!',
    html: '<h1>This is a test!</h1>',
  })

  return {
    messageId: info.messageId,
  }
})