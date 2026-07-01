import type { PrismaClient } from '@prisma/client'

/**
 * Track 2: Cost & Budget Functions
 * All project expense tracking logic lives here.
 */

/** Add an expense amount to a project's totalExpenses. */
export async function addExpenseToProject(
  db: PrismaClient,
  projectID: number,
  amount: number,
): Promise<void> {
  await db.project.update({
    where: { projectID },
    data: { totalExpenses: { increment: Math.round(amount) } },
  })
}

/** Remove an expense amount from a project's totalExpenses (on rejection/cancellation). */
export async function removeExpenseFromProject(
  db: PrismaClient,
  projectID: number,
  amount: number,
): Promise<void> {
  await db.project.update({
    where: { projectID },
    data: { totalExpenses: { decrement: Math.round(amount) } },
  })
}

/** Calculate a request's total expense: sum(qty * unitPrice) + all shipping costs + other expenses. */
export async function calcRequestExpense(
  db: PrismaClient,
  requestID: number,
): Promise<number> {
  const [items, orders, otherExpenses] = await Promise.all([
    db.requestItem.findMany({ where: { requestID } }),
    db.order.findMany({ where: { requestID } }),
    db.otherExpense.findMany({ where: { requestID } }),
  ])

  const itemTotal = items.reduce((sum, i) => sum + i.quantity * i.unitPrice, 0)
  const shippingTotal = orders.reduce((sum, o) => sum + o.shippingCost, 0)
  const otherTotal = otherExpenses.reduce((sum, e) => sum + e.expenseAmount, 0)

  return itemTotal + shippingTotal + otherTotal
}

/** Calculate a reimbursement's total expense: sum(qty * unitPrice) across items. */
export async function calcReimbursementExpense(
  db: PrismaClient,
  reimbursementID: number,
): Promise<number> {
  const items = await db.reimbursementItem.findMany({ where: { reimbursementID } })
  return items.reduce((sum, i) => sum + i.quantity * i.unitPrice, 0)
}

/**
 * Recalculate and sync a project's totalExpenses from scratch.
 * Used after admin edits to ensure accuracy.
 */
export async function recalcProjectExpenses(
  db: PrismaClient,
  projectID: number,
): Promise<void> {
  const [requests, reimbursements, otherExpenses] = await Promise.all([
    db.request.findMany({
      where: { projectID },
      include: { items: true, orders: true, process: true },
    }),
    db.reimbursement.findMany({
      where: { projectID },
      include: { items: true, process: true },
    }),
    db.otherExpense.findMany({ where: { projectID } }),
  ])

  // Rejected/cancelled orders don't count toward project expenses
  const ACTIVE_STATUSES = ['UNDER_REVIEW', 'CHANGES_REQUESTED', 'APPROVED', 'ORDERED', 'RECEIVED', 'PROCESSED']

  const requestTotal = await Promise.all(
    requests
      .filter(r => ACTIVE_STATUSES.includes(r.process.status))
      .map(r => calcRequestExpense(db, r.requestID))
  ).then(amounts => amounts.reduce((sum, a) => sum + a, 0))

  const reimbTotal = reimbursements
    .filter(r => ACTIVE_STATUSES.includes(r.process.status))
    .reduce((sum, r) => sum + r.items.reduce((s, i) => s + i.quantity * i.unitPrice, 0), 0)

  const otherTotal = otherExpenses.reduce((sum, e) => sum + e.expenseAmount, 0)

  await db.project.update({
    where: { projectID },
    data: { totalExpenses: Math.round(requestTotal + reimbTotal + otherTotal) },
  })
}

/** Get remaining budget for a project. */
export function getRemainingBudget(startingBudget: number, totalExpenses: number): number {
  return startingBudget - totalExpenses
}
