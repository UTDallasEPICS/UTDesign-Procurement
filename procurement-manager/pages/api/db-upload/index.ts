/**
 * This API endpoint is used to upload XLSX files and update the database accordingly.
 * It specifically handles students, mentors, and projects.
 * TODOS:
 * - Add more error handling
 * - Handle the case where a student is now a mentor
 * - Handle uploading of vendors, sponsors, non-students (admins, mentors, etc.)
 * - There is no limit to the number of files that can be uploaded nor the size, so I am not sure how to handle that
 */

import { NextApiRequest, NextApiResponse } from 'next'
import formidable, { IncomingForm } from 'formidable'
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
  StudentFileDataError,
  NonStudentFileDataError,
  ProjectFileDataError,
  PersistentFileWithName,
  FileDataErrorWithName,
} from '@/lib/types'
import { sendEmail } from '@/lib/emailService'
import { validateEmailAndReturnNetID } from '@/lib/netid'

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
 * - The JSON data is processed and the database is updated
 * - If there are any errors, a report file is created and sent back to the client
 * - If the client wants to send an email to the admins, the report file is sent to the admins
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

    // This will create the directories if they do not exist
    const { uploadDir, exportDir } = await createDirectories()

    // Because we are handling multiple file uplaods
    const errorDataFiles: FileDataErrorWithName[] = []

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

    const filesToAnalyze = data.files.files as PersistentFileWithName[]
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
    const nonStudentFiles = filesToAnalyze.filter((f) =>
      f.originalFilename.includes('Mentor'),
    )
    const projectFiles = filesToAnalyze.filter((f) =>
      f.originalFilename.includes('Project'),
    )
    const studentFiles = filesToAnalyze.filter((f) =>
      f.originalFilename.includes('Student'),
    )
    for (const file of nonStudentFiles) {
      await analyzeFile(file, errorDataFiles)
    }
    for (const file of projectFiles) {
      await analyzeFile(file, errorDataFiles)
    }
    for (const file of studentFiles) {
      await analyzeFile(file, errorDataFiles)
    }

    // If there are no errors in the uploaded files, send a 200 status without sending a error report file
    if (errorDataFiles[0].errorDataFile.length === 0)
      res.status(200).json({ status: 'ok' })
    // If there are errors in the uploaded files, send a 200 status and send back error report file
    else {
      const reportFilePath = await createResponseFile(errorDataFiles, exportDir)
      let checkReportFileDir = fs.statSync(reportFilePath)
      res.writeHead(200, {
        'Content-type': 'application/xlsx',
        'Content-Disposition': 'attachment; filename=report.xlsx',
      })
      const readStream = fs.createReadStream(reportFilePath)
      readStream.pipe(res)

      // Send an email to the admin with the report file only if the email option from client is true
      if (data.fields.emailOption && data.fields.emailOption[0] === 'true') {
        // Test Email
        // const email = await sendEmail(
        //   'PUT_EMAIL_HERE',
        //   'Database Upload Error Report',
        //   'Attached is the error report for the database upload',
        //   `<p>Attached is the error report for the database upload</p>`,
        //   reportFilePath,
        // )
        sendEmailToAdmins(reportFilePath).then(() => {
          // delete the file after sending the email
          fs.unlinkSync(reportFilePath)
        })
      }
    }
  } catch (error) {
    console.error(error)
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
async function analyzeFile(
  file: PersistentFileWithName,
  errorDataFiles: FileDataErrorWithName[],
) {
  try {
    //@ts-ignore
    const workbook = XLSX.readFile(file.filepath, { cellDates: true })
    if (workbook.SheetNames.length > 1) {
      console.log('More than one sheet')
    } else {
      const sheet = workbook.Sheets[workbook.SheetNames[0]]
      const data: any[] = XLSX.utils.sheet_to_json(sheet)

      let fileType = ''

      // Check type of file (student, non-student, project)
      for (let i = 0; i < data.length; i++) {
        if (data[i]['Project Number'] && data[i]['Title']) {
          fileType = FILE_TYPE.PROJECT
          break
        } else if (data[i]['Email'] && data[i]['Project Number']) {
          fileType = FILE_TYPE.STUDENT
          break
        } else if (data[i]['Faculty Email'] && data[i]['First Name'] && data[i]['Last Name']) {
          fileType = FILE_TYPE.NON_STUDENT
          break
        }
      }

      console.log(file.originalFilename, fileType)

      // Process the file based on its type and update the database
      switch (fileType) {
        case FILE_TYPE.STUDENT:
          // Some of the project numbers are strings, so convert them to numbers
          data.map((student) => {
            student['Project Number'] = Number(student['Project Number'])
          })
          errorDataFiles.push({
            errorDataFile: await handleStudentFile(data as StudentFileData[]),
            originalFilename: file.originalFilename,
          })
          break
        case FILE_TYPE.NON_STUDENT:
          errorDataFiles.push({
            errorDataFile: await handleNonStudentFile(
              data as NonStudentFileData[],
            ),
            originalFilename: file.originalFilename,
          })
          break
        case FILE_TYPE.PROJECT:
          errorDataFiles.push({
            errorDataFile: await handleProjectFile(data as ProjectFileData[]),
            originalFilename: file.originalFilename,
          })
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
  const dataWithError: StudentFileDataError[] = [] // used for storing the any students with errors

  for (const student of data) {
    try {
      const studentEmail = student['Email'].toLowerCase()

      // First check if the student is already in the database
      const exists = await prisma.user.findUnique({
        where: {
          email: studentEmail,
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
              { user: { email: exists.email } },
              { project: { projectNum: student['Project Number'] } },
            ],
          },
        })

        if (!worksOn) {
          // Case 1
          const newWorksOn = await prisma.worksOn.create({
            data: {
              user: { connect: { email: exists.email } },
              project: {
                connect: { projectNum: Number(student['Project Number']) },
              },
              startDate: new Date(), // TODO: Change this to the actual start date
            },
          })

          // Next, add a PreviousRecord for the existing student with the new project
          const previousRecord = await prisma.previousRecord.create({
            data: {
              user: { connect: { email: exists.email } },
              project: { connect: { projectNum: student['Project Number'] } },
              role: { connect: { roleID: 3 } },
            },
          })
        } else {
          // Case 2
          throw new Error(
            'Duplicated Row in File: This student is already working on this project',
          )
        }

        // Finally, update the student's information if it has changed
        const modify = await prisma.user.update({
          where: {
            email: studentEmail,
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
        // First validate email and netID
        const netID = validateEmailAndReturnNetID(studentEmail)

        const user = await prisma.user.create({
          data: {
            firstName: student['First Name'],
            lastName: student['Last Name'],
            email: studentEmail,
            netID: netID,
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
            user: { connect: { email: user.email } },
            project: { connect: { projectNum: student['Project Number'] } },
            startDate: new Date(), // TODO: Change this to the actual start date
          },
        })

        // Finally, add a PreviousRecord for the student
        const previousRecord = await prisma.previousRecord.create({
          data: {
            user: { connect: { email: user.email } },
            project: { connect: { projectNum: student['Project Number'] } },
            role: { connect: { roleID: 3 } },
          },
        })
      }
      index++
    } catch (e) {
      // console.error(`Found an error at row #${index}`)
      index++

      if (e instanceof Prisma.PrismaClientKnownRequestError) {
        if (e.code === 'P2002') {
          console.error(
            'There is a unique constraint violation, a new user cannot be created with this email',
          )
          dataWithError.push({
            ...student,
            ['Reason']:
              'There is a unique constraint violation, a new user cannot be created with this email',
          })
        }
      } else {
        try {
          dataWithError.push({
            ...student,
            ['Reason']: (e as Error).message,
          })
        } catch (error) {
          console.error(error)
        }
      }
    }
  }

  return dataWithError
}

/**
 * Handles the non-student file by iterating over the rows of the non-student file
 * and updating the database accordingly
 * @param data
 */
async function handleNonStudentFile(data: NonStudentFileData[]) {
  let index = 0 // used for finding the index of the non-student that is causing an error
  const dataWithError: NonStudentFileDataError[] = [] // used for storing any non-students with errors

  for (const nonStudent of data) {
    try {
      // First check if the non-student is already in the database
      const nonStudentEmail = nonStudent['Faculty Email'].toLowerCase();
      const exists = await prisma.user.findUnique({
        where: {
          email: nonStudentEmail,
        },
      })

      if (exists) {
        const modify = await prisma.user.update({
          where: {
            email: nonStudentEmail,
          },
          data: {
            firstName: nonStudent['First Name'],
            lastName: nonStudent['Last Name'],
          },
        })
      }

      // If the non-student does not exist, create a new non-student
      else {
        // First validate email and netID
        const netID = validateEmailAndReturnNetID(nonStudentEmail, false)

        // TODO: Change the roleID to the correct one
        // but mentor role should be fine because we're not uploading admins - colin (11/18/24)
        const user = await prisma.user.create({
          data: {
            firstName: nonStudent['First Name'],
            lastName: nonStudent['Last Name'],
            email: nonStudentEmail,
            netID: netID,
            active: true,
            role: {
              connect: {
                roleID: 2,
              },
            },
          },
        })
      }

      index++
    } catch (e) {
      // console.error(`Found an error at row #${index}`)
      index++

      if (e instanceof Prisma.PrismaClientKnownRequestError) {
        if (e.code === 'P2002') {
          // console.error(
          //   'There is a unique constraint violation, a new user cannot be created with this email',
          // )
          dataWithError.push({
            ...nonStudent,
            ['Reason']:
              'There is a unique constraint violation, a new user cannot be created with this email',
          })
        }
      } else {
        // console.error(e)
        dataWithError.push({
          ...nonStudent,
          ['Reason']: (e as Error).message,
        })
      }
    }
  }

  return dataWithError
}

/**
 * Handling the project file by iterating over the rows of the project file
 * and updating the database accordingly
 * @param data
 */
async function handleProjectFile(data: ProjectFileData[]) {
  let index = 0 // used for finding the index of the project that is causing an error
  const dataWithError: ProjectFileDataError[] = [] // used for storing any projects with errors

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
            email: project['Faculty Email']
          },
        })

        
        if (!mentor) throw new Error('Mentor not found')
        console.log(mentor.email)

        const worksOn = await prisma.worksOn.create({
          data: {
            user: { connect: { email: mentor.email } },
            project: { connect: { projectNum: project['Project Number'] } },
            startDate: new Date(), // TODO: Change this to the actual start date
          },
        })
      }

      index++
    } catch (e) {
      // console.error(`Found an error at row #${index}`)
      index++

      if (e instanceof Prisma.PrismaClientKnownRequestError) {
        if (e.code === 'P2002') {
          // console.error(
          //   'There is a unique constraint violation, a new user cannot be created with this email',
          // )
          dataWithError.push({
            ...project,
            ['Reason']:
              'There is a unique constraint violation, a new user cannot be created with this email',
          })
        }
      } else {
        // console.error(e)
        dataWithError.push({
          ...project,
          ['Reason']: (e as Error).message,
        })
      }
    }
  }

  return dataWithError
}

/**
 * Creates the upload and export directories if they do not exist
 * @returns The upload and export directories as strings
 */
async function createDirectories() {
  // Directory where the files will be uploaded
  const uploadDir = join(process.env.ROOT_DIR || process.cwd(), 'uploads/files')
  const exportDir = join(process.env.ROOT_DIR || process.cwd(), 'exports/files')
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
  try {
    await stat(exportDir)
  } catch (e: any) {
    if (e.code === 'ENOENT') {
      await mkdir(exportDir, { recursive: true })
    }
  }

  return { uploadDir, exportDir }
}

/**
 * Each file that was uploaded will have its own sheet in the response file
 * @param dataWithError
 * @returns The Workbook
 */
async function createResponseFile(
  dataWithError: FileDataErrorWithName[],
  exportDir: string,
) {
  const workbook = XLSX.utils.book_new()
  let fileNum = 1
  for (const file of dataWithError) {
    // Apparently the sheet name cannot be longer than 31 characters
    const fileName = file.originalFilename
    let sheetName = fileName.substring(0, fileName.length - 5) // Remove the .xlsx
    if (fileName.length > 31) sheetName = sheetName.substring(0, 31)

    const worksheet = XLSX.utils.json_to_sheet(file.errorDataFile)
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName)
    fileNum++
  }
  XLSX.writeFile(workbook, join(exportDir, 'report.xlsx'), {
    compression: true,
  })

  return join(exportDir, 'report.xlsx')
}

/**
 * This function emails the error report to all of the admins
 * @param reportFilePath
 */
async function sendEmailToAdmins(reportFilePath: string) {
  try {
    // First find all of the admins in the database
    const admins = await prisma.user.findMany({
      where: {
        role: {
          roleID: 1,
        },
      },
    })

    // Iterates over all of the admin users and sends them an email with the report file
    for (const admin of admins) {
      const email = await sendEmail(
        admin.email,
        'Database Upload Error Report',
        'Attached is the error report for the database upload',
        `<p>Attached is the error report for the database upload</p>`,
        reportFilePath,
      )
    }
  } catch (e) {
    console.error(e)
  }
}

// Disable body parser so that we can parse the form data
export const config = {
  api: {
    bodyParser: false,
  },
}
