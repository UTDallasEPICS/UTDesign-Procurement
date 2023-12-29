import { NextApiRequest, NextApiResponse } from 'next'
import formidable, { IncomingForm } from 'formidable'
import PersistentFile from 'formidable/PersistentFile'
import * as XLSX from 'xlsx'
import * as fs from 'fs'
import { join } from 'path'
import { mkdir, stat } from 'fs/promises'
import { prisma } from '@/db'
import { Prisma } from '@prisma/client'
import {
  StudentFileData,
  NonStudentFileData,
  ProjectFileData,
} from '@/lib/types'

// Needed for XLSX to work with the filesystem
XLSX.set_fs(fs)

/**
 * This API endpoint is used to upload the database files
 * and update the database accordingly.
 *
 * The process:
 * - The files were sent using FormData since this was the only way to send files
 *   in Next.js
 * - Formidable is used to parse the form data and upload the files to the server
 * - Then, the files are parsed using XLSX to convert the .xlsx files to JSON
 * - Finally, the JSON data is processed and the database is updated
 * @param req
 * @param res
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  try {
    if (req.method !== 'POST') {
      res.status(405).json({ data: null, error: 'Method Not Allowed' })
      return
    }

    // Directory where the files will be uploaded
    const uploadDir = join(
      process.env.ROOT_DIR || process.cwd(),
      'uploads/files',
    )
    // First check if the directory exists, if not, create it
    try {
      await stat(uploadDir)
    } catch (e: any) {
      if (e.code === 'ENOENT') {
        await mkdir(uploadDir, { recursive: true })
      } else {
        console.error(e)
      }
    }

    // Get the form from the request and parse using formidable
    interface ReturnData {
      fields: formidable.Fields
      files: any
    }
    const data: ReturnData = await new Promise<ReturnData>(
      (resolve, reject) => {
        const form = new IncomingForm({
          multiples: true,
          uploadDir,
          keepExtensions: true,
          filename: (name, ext, part) => {
            return `${part.originalFilename}`
          },
        })

        form.parse(req, (err, fields, files) => {
          if (err) reject(err)
          else resolve({ fields, files })
        })
      },
    )

    const filesToAnalyze = data.files.files as PersistentFile[]
    /**
     * The files are needed to be analyzed in a specific order:
     * 1) Non-student files
     * 2) Project files
     * 3) Student files
     *
     * The reason for this is that the student files depend on the project files
     * and the project files depend on the non-student files.
     * - To create a student, the project must exists to create a WorksOn
     * - To create a project, the project file has the Mentor
     *   so the Mentor must exist to create a WorksOn for the Mentor to the project
     *
     */
    const nonStudentFiles = filesToAnalyze.filter((file) =>
      // @ts-ignore
      file.originalFilename.includes('Mentor'),
    )
    const projectFiles = filesToAnalyze.filter((file) =>
      // @ts-ignore
      file.originalFilename.includes('Project'),
    )
    const studentFiles = filesToAnalyze.filter((file) =>
      // @ts-ignore
      file.originalFilename.includes('Student'),
    )
    for (const file of nonStudentFiles) {
      await analyzeFile(file)
    }
    for (const file of projectFiles) {
      await analyzeFile(file)
    }
    for (const file of studentFiles) {
      await analyzeFile(file)
    }

    res.status(200).json({ status: 'ok' })
  } catch (error) {
    console.log(error)
    res.status(500).json({ status: 'error', message: 'Internal Server Error' })
  }
}

enum FILE_TYPE {
  STUDENT = 'Student',
  NON_STUDENT = 'Mentor/Admin',
  PROJECT = 'Project',
}

/**
 * Analyze file by using XLSX to read and parse the file to JSON
 * and then process the file based on its type
 * **NOTE: This function deletes the file after processing
 * and should be changed if we want to keep the files**
 * @param file File to be parsed and analyzed
 */
async function analyzeFile(file: PersistentFile) {
  try {
    //@ts-ignore
    const workbook = XLSX.readFile(file.filepath, { cellDates: true })
    if (workbook.SheetNames.length > 1) {
      console.log('More than one sheet')
    } else {
      const sheet = workbook.Sheets[workbook.SheetNames[0]]
      const data: any[] = XLSX.utils.sheet_to_json(sheet)

      let fileType = ''

      // Check type of file
      for (let i = 0; i < data.length; i++) {
        if (data[i]['Email'] && data[i]['Project Number']) {
          fileType = FILE_TYPE.STUDENT
          continue
        } else if (data[i]['Faculty Email']) {
          fileType = FILE_TYPE.NON_STUDENT
          continue
        } else if (data[i]['Project Number'] && data[i]['Title']) {
          fileType = FILE_TYPE.PROJECT
          continue
        }
      }

      // Process the file based on its type and update the database
      switch (fileType) {
        case FILE_TYPE.STUDENT:
          // Some of the project numbers are strings, so convert them to numbers
          data.map((student) => {
            student['Project Number'] = Number(student['Project Number'])
          })
          await handleStudentFile(data as StudentFileData[])
          break
        case FILE_TYPE.NON_STUDENT:
          await handleNonStudentFile(data as NonStudentFileData[])
          break
        case FILE_TYPE.PROJECT:
          await handleProjectFile(data as ProjectFileData[])
          break
        default:
          break
      }

      // Finally, delete the file
      //@ts-ignore
      await fs.unlink(file.filepath, (err) => {
        if (err) throw err
      })
    }
  } catch (error) {
    console.log('Something went wrong', error)
  }
}

/**
 * Handles the student file by iterating over the rows of the student file
 * and updating the database accordingly
 * @param data
 */
async function handleStudentFile(data: StudentFileData[]) {
  let index = 0 // used for finding the index of the student that is causing an error
  for (const student of data) {
    try {
      // First check if the student is already in the database
      const exists = await prisma.user.findUnique({
        where: {
          email: student['Email'].toLowerCase(),
        },
      })

      /**
       * Cases if the student already exists:
       * 1) This student is working on another project => create another WorksOn
       * 2) Handle that there may be a truly duplicated row => ignore
       * 3) (TODO) Edge Case: This user was once a student but have now become a mentor
       */
      if (exists) {
        // First find if the studentis working on the given project number
        const worksOn = await prisma.worksOn.findFirst({
          where: {
            AND: [
              { user: { netID: exists.netID } },
              { project: { projectNum: student['Project Number'] } },
            ],
          },
        })

        if (!worksOn) {
          // Case 1
          const newWorksOn = await prisma.worksOn.create({
            data: {
              user: { connect: { netID: exists.netID } },
              project: {
                connect: { projectNum: Number(student['Project Number']) },
              },
              startDate: new Date(), // TODO: Change this to the actual start date
            },
          })

          // Next, add a PreviousRecord for the existing student with the new project
          const previousRecord = await prisma.previousRecord.create({
            data: {
              user: { connect: { netID: exists.netID } },
              project: { connect: { projectNum: student['Project Number'] } },
              role: { connect: { roleID: 3 } },
            },
          })
        } else {
          // Case 2
          console.warn(
            'Duplicated Row: This student is already working on this project',
          )
        }

        // Finally, update the student's information if it has changed
        const modify = await prisma.user.update({
          where: {
            email: student['Email'],
          },
          data: {
            firstName: student['First Name'],
            lastName: student['Last Name'],
            active: student['Deactivation Date'] ? false : true,
            deactivationDate: student['Deactivation Date']
              ? new Date(student['Deactivation Date'])
              : null,
          },
        })
      }

      // If the student does not exist, create a new student
      else {
        const user = await prisma.user.create({
          data: {
            firstName: student['First Name'],
            lastName: student['Last Name'],
            email: student['Email'].toLowerCase(),
            netID: student['Email'].toLowerCase().split('@')[0],
            active: student['Deactivation Date'] ? false : true,
            role: {
              connect: {
                roleID: 3,
              },
            },
            deactivationDate: student['Deactivation Date']
              ? new Date(student['Deactivation Date'])
              : null,
          },
        })

        // After creating the student, connect them to the project
        const worksOn = await prisma.worksOn.create({
          data: {
            user: { connect: { netID: user.netID } },
            project: { connect: { projectNum: student['Project Number'] } },
            startDate: new Date(), // TODO: Change this to the actual start date
          },
        })

        // Finally, add a PreviousRecord for the student
        const previousRecord = await prisma.previousRecord.create({
          data: {
            user: { connect: { netID: user.netID } },
            project: { connect: { projectNum: student['Project Number'] } },
            role: { connect: { roleID: 3 } },
          },
        })
      }
      index++
    } catch (e) {
      console.error(`Found an error at row #${index}`)

      if (e instanceof Prisma.PrismaClientKnownRequestError) {
        if (e.code === 'P2002') {
          console.error(
            'There is a unique constraint violation, a new user cannot be created with this email',
          )
        }
      } else {
        console.error(e)
      }
    }
  }
}

/**
 * Handles the non-student file by iterating over the rows of the non-student file
 * and updating the database accordingly
 * @param data
 */
async function handleNonStudentFile(data: NonStudentFileData[]) {
  let index = 0 // used for finding the index of the non-student that is causing an error
  for (const nonStudent of data) {
    try {
      // First check if the non-student is already in the database
      const exists = await prisma.user.findUnique({
        where: {
          email: nonStudent['Faculty Email'],
        },
      })

      if (exists) {
        const modify = await prisma.user.update({
          where: {
            email: nonStudent['Faculty Email'],
          },
          data: {
            firstName: nonStudent['First Name'],
            lastName: nonStudent['Last Name'],
          },
        })
      }

      // If the non-student does not exist, create a new non-student
      else {
        // TODO: Change the roleID to the correct one
        const user = await prisma.user.create({
          data: {
            firstName: nonStudent['First Name'],
            lastName: nonStudent['Last Name'],
            email: nonStudent['Faculty Email'].toLowerCase(),
            netID: nonStudent['Faculty Email'].toLowerCase().split('@')[0],
            active: true,
            role: {
              connect: {
                roleID: 2,
              },
            },
          },
        })
      }
    } catch (e) {
      console.error(`Found an error at row #${index}`)

      if (e instanceof Prisma.PrismaClientKnownRequestError) {
        if (e.code === 'P2002') {
          console.error(
            'There is a unique constraint violation, a new user cannot be created with this email',
          )
        }
      } else {
        console.error(e)
      }
    }
  }
}

/**
 * Handling the project file by iterating over the rows of the project file
 * and updating the database accordingly
 * @param data
 */
async function handleProjectFile(data: ProjectFileData[]) {
  let index = 0 // used for finding the index of the project that is causing an error
  for (const project of data) {
    try {
      // First check if project exists in the database
      const exists = await prisma.project.findUnique({
        where: {
          projectNum: project['Project Number'],
        },
      })

      // If the project exists in the database, just update it
      if (exists) {
        const modify = await prisma.project.update({
          where: {
            projectNum: project['Project Number'],
          },
          data: {
            projectTitle: project['Title'],
            projectType: project['Project Type'],
            sponsorCompany: project['Company'],
            activationDate: new Date(project['Project Start']),
            deactivationDate: project['Project End']
              ? new Date(project['Project End'])
              : null,
          },
        })
      }
      // If the project does not exist, create a new project
      else {
        const newProject = await prisma.project.create({
          data: {
            projectNum: project['Project Number'],
            projectTitle: project['Title'],
            projectType: project['Project Type'],
            startingBudget: project['Starting Budget']
              ? project['Starting Budget']
              : 0,
            sponsorCompany: project['Company'],
            activationDate: new Date(project['Project Start']),
          },
        })

        // After creating the project, connect the mentor to the project
        const mentor = await prisma.user.findFirst({
          where: {
            AND: [
              { firstName: project['TM First Name'] },
              { lastName: project['TM Last Name'] },
            ],
          },
        })

        if (!mentor) throw new Error('Mentor not found')

        const worksOn = await prisma.worksOn.create({
          data: {
            user: { connect: { netID: mentor.netID } },
            project: { connect: { projectNum: project['Project Number'] } },
            startDate: new Date(), // TODO: Change this to the actual start date
          },
        })
      }

      index++
    } catch (e) {
      console.error(`Found an error at row #${index}`)

      if (e instanceof Prisma.PrismaClientKnownRequestError) {
        if (e.code === 'P2002') {
          console.error(
            'There is a unique constraint violation, a new project cannot be created with this project number',
          )
        }
      } else {
        console.error(e)
      }
    }
  }
}

// Disable body parser so that we can parse the form data
export const config = {
  api: {
    bodyParser: false,
  },
}
