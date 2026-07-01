import { PrismaClient, UserRole } from '@prisma/client'
import { scrypt, randomBytes } from 'node:crypto'
import { promisify } from 'node:util'

/**
 * Dev seed — run with: npm run db:seed
 *
 * Creates users, projects, vendors, and BetterAuth login accounts.
 *
 * Dev credentials (password: "password123"):
 *  abc000000@utdallas.edu → STUDENT
 *  def000000@utdallas.edu → MENTOR
 *  ghi000000@utdallas.edu → ADMIN
 *
 * For bulk data import from the legacy Excel-based system, add that logic
 * here and run manually with: npm run db:seed
 * Do NOT expose import logic as an HTTP endpoint.
 */

const prisma = new PrismaClient()
const scryptAsync = promisify(scrypt)

async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString('hex')
  const key = (await scryptAsync(password.normalize('NFKC'), salt, 64, {
    N: 16384, r: 16, p: 1, maxmem: 128 * 16384 * 16 * 2,
  })) as Buffer
  return `${salt}:${key.toString('hex')}`
}

async function main() {
  console.log('Seeding database...')

  const devUsers = [
    { email: 'abc000000@utdallas.edu', firstName: 'Alex',  lastName: 'Student', netID: 'abc000000', role: UserRole.STUDENT },
    { email: 'def000000@utdallas.edu', firstName: 'Dana',  lastName: 'Mentor',  netID: 'def000000', role: UserRole.MENTOR  },
    { email: 'ghi000000@utdallas.edu', firstName: 'Grace', lastName: 'Admin',   netID: 'ghi000000', role: UserRole.ADMIN   },
  ]

  const createdUsers = []
  for (const u of devUsers) {
    const user = await prisma.user.upsert({
      where: { email: u.email },
      update: {},
      create: { email: u.email, firstName: u.firstName, lastName: u.lastName, netID: u.netID, role: u.role, active: true },
    })
    createdUsers.push(user)
    console.log(`User: ${u.email} (role=${u.role})`)
  }

  const [student, mentor] = createdUsers

  // ── BetterAuth Login Accounts ──────────────────────────────────────────────
  const now = new Date().toISOString()
  for (const user of createdUsers) {
    const meta = devUsers.find(u => u.email === user.email)!
    const name = `${meta.firstName} ${meta.lastName}`
    const authUserId = crypto.randomUUID()

    await prisma.$executeRawUnsafe(
      `INSERT OR IGNORE INTO "AuthUser" ("id","name","email","emailVerified","createdAt","updatedAt") VALUES (?,?,?,0,?,?)`,
      authUserId, name, user.email, now, now,
    )

    const existing = await prisma.$queryRawUnsafe<{ id: string }[]>(
      `SELECT id FROM "AuthUser" WHERE email = ?`, user.email,
    )
    const finalId = existing[0].id
    const hash = await hashPassword('password123')

    await prisma.$executeRawUnsafe(
      `INSERT OR IGNORE INTO "AuthAccount" ("id","accountId","providerId","userId","password","createdAt","updatedAt") VALUES (?,?,?,?,?,?,?)`,
      crypto.randomUUID(), user.email, 'credential', finalId, hash, now, now,
    )
  }
  console.log('BetterAuth login accounts created.')

  // ── Projects ───────────────────────────────────────────────────────────────
  const project1 = await prisma.project.upsert({
    where: { projectNum: '10000' },
    update: {},
    create: {
      projectNum: '10000', projectTitle: 'Smart Campus Sensor Network',
      projectType: 'Capstone', startingBudget: 5000,
      sponsorCompany: 'Texas Instruments', activationDate: new Date(),
    },
  })

  const project2 = await prisma.project.upsert({
    where: { projectNum: '20000' },
    update: {},
    create: {
      projectNum: '20000', projectTitle: 'EPICS Community Outreach App',
      projectType: 'EPICS', startingBudget: 2500,
      sponsorCompany: 'UTD Community', activationDate: new Date(),
    },
  })
  console.log(`Projects: ${project1.projectNum}, ${project2.projectNum}`)

  // ── Vendors ────────────────────────────────────────────────────────────────
  await prisma.vendor.upsert({ where: { vendorID: 1 }, update: { isPreferred: true }, create: { vendorName: 'Digi-Key Electronics', vendorStatus: 'APPROVED', vendorURL: 'https://www.digikey.com', isPreferred: true } })
  await prisma.vendor.upsert({ where: { vendorID: 2 }, update: { isPreferred: true }, create: { vendorName: 'McMaster-Carr',        vendorStatus: 'APPROVED', vendorURL: 'https://www.mcmaster.com', isPreferred: true } })
  await prisma.vendor.upsert({ where: { vendorID: 3 }, update: {},                    create: { vendorName: 'Unknown Supplier',     vendorStatus: 'PENDING',  vendorURL: 'https://default.com' } })
  await prisma.vendor.upsert({ where: { vendorID: 4 }, update: {},                    create: { vendorName: 'Generic Web Store',    vendorStatus: 'APPROVED', vendorURL: 'https://example.com' } })
  console.log('Vendors seeded.')

  // ── WorksOn ────────────────────────────────────────────────────────────────
  const startDate = new Date('2025-01-01')
  await prisma.worksOn.upsert({
    where: { userID_projectID_startDate: { userID: student.id, projectID: project1.projectID, startDate } },
    update: {},
    create: { userID: student.id, projectID: project1.projectID, startDate },
  })
  await prisma.worksOn.upsert({
    where: { userID_projectID_startDate: { userID: mentor.id, projectID: project1.projectID, startDate } },
    update: {},
    create: { userID: mentor.id, projectID: project1.projectID, startDate },
  })

  console.log('\n✅ Seed complete!')
  console.log('\nDev credentials (password: password123):')
  console.log('  Student: abc000000@utdallas.edu')
  console.log('  Mentor:  def000000@utdallas.edu')
  console.log('  Admin:   ghi000000@utdallas.edu')
}

main()
  .catch(e => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
