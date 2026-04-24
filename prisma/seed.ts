import { PrismaClient } from '@prisma/client'

/**
 * Dev seed data — run with: npm run db:seed
 *
 * Creates:
 *  - 3 roles (Admin, Mentor, Student)
 *  - 3 dev users (one per role)
 *  - 2 sample projects
 *  - 3 sample vendors (APPROVED, PENDING, DENIED)
 *  - WorksOn entries linking users to projects
 *
 * Dev credentials (email + password "password123"):
 *  - abc000000@utdallas.edu  → Student
 *  - def000000@utdallas.edu  → Mentor
 *  - ghi000000@utdallas.edu  → Admin
 *
 * NOTE: Passwords are handled by BetterAuth.
 * After seeding, create accounts via BetterAuth signUp or the admin panel.
 * This seed only creates the User records in our custom table.
 */

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  // ── Roles ──────────────────────────────────────────────────────────────────
  const adminRole = await prisma.role.upsert({
    where: { role: 'Admin' },
    update: {},
    create: { role: 'Admin' },
  })
  const mentorRole = await prisma.role.upsert({
    where: { role: 'Mentor' },
    update: {},
    create: { role: 'Mentor' },
  })
  const studentRole = await prisma.role.upsert({
    where: { role: 'Student' },
    update: {},
    create: { role: 'Student' },
  })

  console.log(`Roles: Admin=${adminRole.roleID}, Mentor=${mentorRole.roleID}, Student=${studentRole.roleID}`)

  // ── Users ──────────────────────────────────────────────────────────────────
  const student = await prisma.user.upsert({
    where: { email: 'abc000000@utdallas.edu' },
    update: {},
    create: {
      email: 'abc000000@utdallas.edu',
      firstName: 'Alex',
      lastName: 'Student',
      netID: 'abc000000',
      roleID: studentRole.roleID,
      active: true,
    },
  })

  const mentor = await prisma.user.upsert({
    where: { email: 'def000000@utdallas.edu' },
    update: {},
    create: {
      email: 'def000000@utdallas.edu',
      firstName: 'Dana',
      lastName: 'Mentor',
      netID: 'def000000',
      roleID: mentorRole.roleID,
      active: true,
    },
  })

  const admin = await prisma.user.upsert({
    where: { email: 'ghi000000@utdallas.edu' },
    update: {},
    create: {
      email: 'ghi000000@utdallas.edu',
      firstName: 'Grace',
      lastName: 'Admin',
      netID: 'ghi000000',
      roleID: adminRole.roleID,
      active: true,
    },
  })

  console.log(`Users: student=${student.id}, mentor=${mentor.id}, admin=${admin.id}`)

  // ── Projects ───────────────────────────────────────────────────────────────
  const project1 = await prisma.project.upsert({
    where: { projectNum: '10000' },
    update: {},
    create: {
      projectNum: '10000',
      projectTitle: 'Smart Campus Sensor Network',
      projectType: 'Capstone',
      startingBudget: 5000,
      sponsorCompany: 'Texas Instruments',
      activationDate: new Date(),
    },
  })

  const project2 = await prisma.project.upsert({
    where: { projectNum: '20000' },
    update: {},
    create: {
      projectNum: '20000',
      projectTitle: 'EPICS Community Outreach App',
      projectType: 'EPICS',
      startingBudget: 2500,
      sponsorCompany: 'UTD Community',
      activationDate: new Date(),
    },
  })

  console.log(`Projects: ${project1.projectNum}, ${project2.projectNum}`)

  // ── Vendors ────────────────────────────────────────────────────────────────
  await prisma.vendor.upsert({
    where: { vendorID: 1 },
    update: {},
    create: {
      vendorName: 'Digi-Key Electronics',
      vendorStatus: 'APPROVED',
      vendorURL: 'https://www.digikey.com',
    },
  })

  await prisma.vendor.upsert({
    where: { vendorID: 2 },
    update: {},
    create: {
      vendorName: 'McMaster-Carr',
      vendorStatus: 'APPROVED',
      vendorURL: 'https://www.mcmaster.com',
    },
  })

  await prisma.vendor.upsert({
    where: { vendorID: 3 },
    update: {},
    create: {
      vendorName: 'Unknown Supplier',
      vendorStatus: 'PENDING',
      vendorURL: 'https://default.com',
    },
  })

  console.log('Vendors seeded.')

  // ── WorksOn ────────────────────────────────────────────────────────────────
  const worksOnStudent = await prisma.worksOn.upsert({
    where: {
      userID_projectID_startDate: {
        userID: student.id,
        projectID: project1.projectID,
        startDate: new Date('2025-01-01'),
      },
    },
    update: {},
    create: {
      userID: student.id,
      projectID: project1.projectID,
      startDate: new Date('2025-01-01'),
    },
  })

  const worksOnMentor = await prisma.worksOn.upsert({
    where: {
      userID_projectID_startDate: {
        userID: mentor.id,
        projectID: project1.projectID,
        startDate: new Date('2025-01-01'),
      },
    },
    update: {},
    create: {
      userID: mentor.id,
      projectID: project1.projectID,
      startDate: new Date('2025-01-01'),
    },
  })

  console.log('WorksOn entries seeded.')
  console.log('\nSeed complete!')
  console.log('\nDev login emails:')
  console.log('  Student: abc000000@utdallas.edu')
  console.log('  Mentor:  def000000@utdallas.edu')
  console.log('  Admin:   ghi000000@utdallas.edu')
  console.log('\nCreate BetterAuth accounts for these emails after first run.')
}

main()
  .catch(e => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
