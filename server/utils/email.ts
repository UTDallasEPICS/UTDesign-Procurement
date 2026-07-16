import { ROLES } from '~~/shared/constants/roles'
import nodemailer from 'nodemailer'
import type { PrismaClient } from '@prisma/client'

function createTransporter() {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.NODEMAILER_EMAIL,
      pass: process.env.NODEMAILER_PASSWORD,
    },
  })
}

/** Send an email to a single recipient. */
export async function sendEmail(
  to: string,
  subject: string,
  html: string,
  attachmentPath?: string,
): Promise<void> {
  const transporter = createTransporter()
  await transporter.sendMail({
    from: `"UTDesign Procurement" <${process.env.NODEMAILER_EMAIL}>`,
    to,
    subject,
    html,
    attachments: attachmentPath
      ? [{ filename: 'report.xlsx', path: attachmentPath }]
      : undefined,
  })
}

/** Send an email to all admin users in the database. */
export async function sendEmailToAdmins(
  db: PrismaClient,
  subject: string,
  html: string,
  attachmentPath?: string,
): Promise<void> {
  const admins = await db.user.findMany({
    where: { role: ROLES.ADMIN, active: true },
    select: { email: true },
  })

  await Promise.all(admins.map(a => sendEmail(a.email, subject, html, attachmentPath)))
}

// ─── Email Templates ──────────────────────────────────────────────────────────

function baseTemplate(body: string): string {
  return `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
      <div style="background:#154734;padding:16px 24px;">
        <h2 style="color:#fff;margin:0;">UTDesign Procurement</h2>
      </div>
      <div style="padding:24px;background:#fff;border:1px solid #D9D9D9;">
        ${body}
      </div>
      <div style="padding:12px 24px;background:#F4F4F4;font-size:12px;color:#5A5A5A;">
        This is an automated message from the UTDesign Procurement System.
      </div>
    </div>
  `
}

export function templateRequestSubmitted(projectTitle: string, studentName: string): string {
  return baseTemplate(`
    <p>A new procurement request has been submitted and is awaiting your review.</p>
    <p><strong>Project:</strong> ${projectTitle}</p>
    <p><strong>Submitted by:</strong> ${studentName}</p>
    <p>Please log in to the procurement system to review and approve or reject this request.</p>
  `)
}

export function templateRequestApproved(projectTitle: string, comment?: string): string {
  return baseTemplate(`
    <p>Your procurement request for <strong>${projectTitle}</strong> has been <span style="color:#154734;font-weight:bold;">approved</span> by your mentor.</p>
    ${comment ? `<p><strong>Comment:</strong> ${comment}</p>` : ''}
    <p>Your request is now pending admin processing.</p>
  `)
}

export function templateRequestRejected(projectTitle: string, comment?: string): string {
  return baseTemplate(`
    <p>Your procurement request for <strong>${projectTitle}</strong> has been <span style="color:#C62828;font-weight:bold;">rejected</span>.</p>
    ${comment ? `<p><strong>Reason:</strong> ${comment}</p>` : ''}
    <p>You may log in to edit and resubmit your request.</p>
  `)
}

export function templateRequestChangesRequested(projectTitle: string, comment?: string): string {
  return baseTemplate(`
    <p>Changes have been requested on your procurement request for <strong>${projectTitle}</strong>.</p>
    ${comment ? `<p><strong>Requested changes:</strong> ${comment}</p>` : ''}
    <p>You may log in to edit and resubmit your request.</p>
  `)
}

export function templateRequestOrdered(projectTitle: string, orderNumber?: string): string {
  return baseTemplate(`
    <p>Your procurement request for <strong>${projectTitle}</strong> has been <span style="color:#1565C0;font-weight:bold;">ordered</span>.</p>
    ${orderNumber ? `<p><strong>Order Number:</strong> ${orderNumber}</p>` : ''}
    <p>You will be notified when your items are received.</p>
  `)
}

export function templateTrackingRequested(projectTitle: string, studentName: string, requestID: number): string {
  return baseTemplate(`
    <p><strong>${studentName}</strong> has requested tracking information for an ordered procurement request.</p>
    <p><strong>Project:</strong> ${projectTitle}</p>
    <p><strong>Request:</strong> #${requestID}</p>
    <p>Please log in and add tracking information to the order.</p>
  `)
}

export function templateReimbursementSubmitted(projectTitle: string, studentName: string): string {
  return baseTemplate(`
    <p>A new reimbursement request has been submitted and is awaiting your review.</p>
    <p><strong>Project:</strong> ${projectTitle}</p>
    <p><strong>Submitted by:</strong> ${studentName}</p>
  `)
}

export function templateReimbursementApproved(projectTitle: string): string {
  return baseTemplate(`
    <p>Your reimbursement request for <strong>${projectTitle}</strong> has been <span style="color:#154734;font-weight:bold;">approved</span> by your mentor.</p>
    <p>Your request is now pending admin processing.</p>
  `)
}

export function templateReimbursementRejected(projectTitle: string, comment?: string): string {
  return baseTemplate(`
    <p>Your reimbursement request for <strong>${projectTitle}</strong> has been <span style="color:#C62828;font-weight:bold;">rejected</span>.</p>
    ${comment ? `<p><strong>Reason:</strong> ${comment}</p>` : ''}
    <p>You may log in to edit and resubmit your request.</p>
  `)
}

export function templateReimbursementChangesRequested(projectTitle: string, comment?: string): string {
  return baseTemplate(`
    <p>Changes have been requested on your reimbursement request for <strong>${projectTitle}</strong>.</p>
    ${comment ? `<p><strong>Requested changes:</strong> ${comment}</p>` : ''}
    <p>You may log in to edit and resubmit your request.</p>
  `)
}

export function templateReimbursementProcessed(projectTitle: string): string {
  return baseTemplate(`
    <p>Your reimbursement request for <strong>${projectTitle}</strong> has been <span style="color:#6A1B9A;font-weight:bold;">processed</span>.</p>
    <p>Please allow time for the reimbursement to be reflected in your account.</p>
  `)
}

