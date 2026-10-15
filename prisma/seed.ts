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
      name: "Alex Student",
      netID: "abc000000",
      role: UserRole.STUDENT,
    },
    {
      email: "cxg230016@utdallas.edu",
      name: "CXG Student",
      netID: "cxg230016",
      role: UserRole.STUDENT,
    },
    {
      email: "def000000@utdallas.edu",
      name: "Dana Mentor",
      netID: "def000000",
      role: UserRole.MENTOR,
    },
    {
      email: "ghi000000@utdallas.edu",
      name: "Grace Admin",
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
        name: u.name,
        netID: u.netID,
        role: u.role,
        active: true,
      },
      create: {
        name: u.name,
        email: u.email,
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
      vendorID: 1,
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
      vendorID: 2,
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
      vendorID: 3,
      vendorName: "Unknown Supplier",
      vendorStatus: "PENDING",
      vendorURL: "https://default.com",
    },
  })

  await prisma.vendor.upsert({
    where: { vendorID: 4 },
    update: {},
    create: {
      vendorID: 4,
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
