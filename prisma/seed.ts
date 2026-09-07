import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3"
import { PrismaClient, UserRole } from "./generated/client"

/**
 * Dev seed — run with: npm run db:seed
 *
 * Creates users, projects, and vendors.
 *
 * Authentication:
 *   Users authenticate through email OTP.
 *   No passwords are seeded or stored.
 *
 * Seeded users:
 *   abc000000@utdallas.edu → STUDENT
 *   cxg230016@utdallas.edu → STUDENT
 *   def000000@utdallas.edu → MENTOR
 *   ghi000000@utdallas.edu → ADMIN
 *
 * For bulk data import from the legacy Excel-based system, add that logic
 * here and run manually with: npm run db:seed
 * Do NOT expose import logic as an HTTP endpoint.
 */

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL,
})

const prisma = new PrismaClient({ adapter })

async function main() {
  console.log("Seeding database...")

  // ── Users ──────────────────────────────────────────────────────────────────
 const devUsers = [
  {
    email: "abc000000@utdallas.edu",
    firstName: "Alex",
    lastName: "Student",
    netID: "abc000000",
    role: UserRole.STUDENT,
  },
  {
    email: "cxg230016@utdallas.edu",
    firstName: "CXG",
    lastName: "Student",
    netID: "cxg230016",
    role: UserRole.STUDENT,
  },
  {
    email: "def000000@utdallas.edu",
    firstName: "Dana",
    lastName: "Mentor",
    netID: "def000000",
    role: UserRole.MENTOR,
  },
  {
    email: "ghi000000@utdallas.edu",
    firstName: "Grace",
    lastName: "Admin",
    netID: "ghi000000",
    role: UserRole.ADMIN,
  },
]

  const createdUsers = []


for (const u of devUsers) {
  const user = await prisma.user.upsert({
    where: {
      email: u.email,
    },
    update: {
      firstName: u.firstName,
      lastName: u.lastName,
      netID: u.netID,
      role: u.role,
      active: true,
    },
    create: {
      email: u.email,
      firstName: u.firstName,
      lastName: u.lastName,
      netID: u.netID,
      role: u.role,
      active: true,
    },
  })

  createdUsers.push(user)

  console.log(`User: ${u.email} (role=${u.role})`)
}

  const student = createdUsers.find(
    (user) => user.email === "abc000000@utdallas.edu",
  )

  const mentor = createdUsers.find(
    (user) => user.email === "def000000@utdallas.edu",
  )

  if (!student || !mentor) {
    throw new Error("Required seed users were not created.")
  }

  // ── BetterAuth Users ───────────────────────────────────────────────────────
  //
  // No password is created here.
  //
  // Email OTP authentication should be handled by BetterAuth's email OTP
  // plugin/configuration. The AuthUser records below simply ensure that
  // BetterAuth knows about the seeded users.
  //
  const now = new Date().toISOString()

  for (const user of createdUsers) {
    const meta = devUsers.find((u) => u.email === user.email)

    if (!meta) {
      throw new Error(`Could not find seed metadata for ${user.email}`)
    }

    const name = `${meta.firstName} ${meta.lastName}`

    const existingUser = await prisma.$queryRawUnsafe<
      { id: string }[]
    >(
      `SELECT id FROM "User" WHERE email = ?`,
      user.email,
    )

    let UserId: string

    if (existingUser.length > 0) {
      UserId = existingUser[0].id
    } else {
      UserId = crypto.randomUUID()

      await prisma.$executeRawUnsafe(
        `INSERT INTO "User"
          ("id", "name", "email", "emailVerified", "createdAt", "updatedAt")
         VALUES (?, ?, ?, 0, ?, ?)`,
        UserId,
        name,
        user.email,
        now,
        now,
      )
    }

    console.log(`BetterAuth user: ${user.email}`)
  }

  console.log("BetterAuth users created.")
  console.log("No password credentials were seeded.")
  console.log("Authentication should use email OTP.")

  // ── Projects ───────────────────────────────────────────────────────────────
  const project1 = await prisma.project.upsert({
    where: {
      projectNum: "10000",
    },
    update: {},
    create: {
      projectNum: "10000",
      projectTitle: "Smart Campus Sensor Network",
      projectType: "Capstone",
      startingBudget: 5000,
      sponsorCompany: "Texas Instruments",
      activationDate: new Date(),
    },
  })

  const project2 = await prisma.project.upsert({
    where: {
      projectNum: "20000",
    },
    update: {},
    create: {
      projectNum: "20000",
      projectTitle: "EPICS Community Outreach App",
      projectType: "EPICS",
      startingBudget: 2500,
      sponsorCompany: "UTD Community",
      activationDate: new Date(),
    },
  })

  console.log(`Projects: ${project1.projectNum}, ${project2.projectNum}`)

  // ── Vendors ────────────────────────────────────────────────────────────────
  await prisma.vendor.upsert({
    where: { vendorID: 1 },
    update: { isPreferred: true },
    create: {
      vendorName: "Digi-Key Electronics",
      vendorStatus: "APPROVED",
      vendorURL: "https://www.digikey.com",
      isPreferred: true,
    },
  })

  await prisma.vendor.upsert({
    where: { vendorID: 2 },
    update: { isPreferred: true },
    create: {
      vendorName: "McMaster-Carr",
      vendorStatus: "APPROVED",
      vendorURL: "https://www.mcmaster.com",
      isPreferred: true,
    },
  })

  await prisma.vendor.upsert({
    where: { vendorID: 3 },
    update: {},
    create: {
      vendorName: "Unknown Supplier",
      vendorStatus: "PENDING",
      vendorURL: "https://default.com",
    },
  })

  await prisma.vendor.upsert({
    where: { vendorID: 4 },
    update: {},
    create: {
      vendorName: "Generic Web Store",
      vendorStatus: "APPROVED",
      vendorURL: "https://example.com",
    },
  })

  console.log("Vendors seeded.")

  // ── WorksOn ────────────────────────────────────────────────────────────────
  const startDate = new Date("2025-01-01")

  await prisma.worksOn.upsert({
    where: {
      userID_projectID_startDate: {
        userID: student.id,
        projectID: project1.projectID,
        startDate,
      },
    },
    update: {},
    create: {
      userID: student.id,
      projectID: project1.projectID,
      startDate,
    },
  })

  await prisma.worksOn.upsert({
    where: {
      userID_projectID_startDate: {
        userID: mentor.id,
        projectID: project1.projectID,
        startDate,
      },
    },
    update: {},
    create: {
      userID: mentor.id,
      projectID: project1.projectID,
      startDate,
    },
  })

  console.log("\n✅ Seed complete!")

  console.log("\nDev users — authenticate with email OTP:")
  console.log("  Student: abc000000@utdallas.edu")
  console.log("  Student: cxg230016@utdallas.edu")
  console.log("  Mentor:  def000000@utdallas.edu")
  console.log("  Admin:   ghi000000@utdallas.edu")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
