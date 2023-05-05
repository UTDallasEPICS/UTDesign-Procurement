import React, { useEffect, useState } from 'react'
import { Row, Collapse } from 'react-bootstrap'
import AdminRequestCard from '@/components/AdminRequestCard'
import ProjectHeader from '@/components/ProjectHeader'
import ReimbursementCard from '@/components/AdminReimbursementCard'
import { prisma } from '@/db'
import { RequestDetails } from '@/lib/types'
import { Prisma, Project, Status, User } from '@prisma/client'
import RejectionModal from '@/components/RejectionModal'
import axios from 'axios'
import { Session, getServerSession } from 'next-auth'
import { authOptions } from '../api/auth/[...nextauth]'

export async function getServerSideProps(context: any) {
  const session = await getServerSession(context.req, context.res, authOptions)
  const user = session?.user as User

  // projects and requests are loaded from the server-side first (I wanted it try it out)
  // These will be passed to a state so if we need to fetch again, we can just update the state
  const projects = await prisma.project.findMany()
  const requestOfMultipleProjects: RequestDetails[][] = []

  // Next.js recommends that instead of calling from '/api/request-form/get', just perform the query here
  // to reduce the number of API calls and improve performance because getServerSideProps can do server-side code
  for (const project of projects) {
    const requests = await prisma.request.findMany({
      where: {
        projectID: project.projectID,
        Process: {
          some: {
            status: Status.APPROVED,
          },
        },
      },
      include: {
        RequestItem: true,
        Process: true,
        OtherExpense: true,
        project: true,
      },
    })
    requestOfMultipleProjects.push(requests)
  }

  console.log(projects)

  return {
    // needed to stringify the object first to avoid non-serializable error
    props: {
      session: session,
      user: user,
      reqs: JSON.parse(JSON.stringify(requestOfMultipleProjects)),
      projs: JSON.parse(JSON.stringify(projects)),
    },
  }
}

interface AdminProps {
  session: Session | null
  user: User
  reqs: RequestDetails[][]
  projs: Project[]
}

export default function Admin({
  session,
  user,
  reqs,
  projs,
}: AdminProps): JSX.Element {
  const [isOpen, setIsOpen] = useState<boolean[]>([])
  // state for the modal for rejecting requests
  const [showRejectModal, setShowRejectModal] = useState(false)
  // state to set the request number for the reject modal to show
  const [selectedRequestID, setSelectedRequestID] = useState<number | null>(
    null
  )
  const [projects, setProjects] = useState<Project[]>(projs)
  const [projectRequests, setProjectRequests] =
    useState<RequestDetails[][]>(reqs)

  useEffect(() => {
    setIsOpen(projects.map(() => true))
  }, [])

  // Client-side data fetching, but can be done with getServerSideProps
  async function getAdmin() {
    const response = await axios.post('/api/request-form/get', {
      netID: user.netID,
    })
    const [projects, requestsOfMultipleProjects] = await Promise.all([
      response.data.projects,
      response.data.requests,
    ])
    setProjects(projects)
    setProjectRequests(requestsOfMultipleProjects)
    setIsOpen(projects.map(() => true))
  }

  /**
   * This function is called after the mentor clicks the reject button on a request.
   * @param requestID - The requestID of the request being rejected.
   */
  const handleReject = (requestID: number) => {
    setSelectedRequestID(requestID)
    setShowRejectModal(true)
  }

  /**
   * This function is called after the mentor submits the rejection reason through the RejectionModal.
   * @param reason - The reason for rejecting the request.
   */
  const handleSubmitRejection = async (reason: string) => {
    setShowRejectModal(false)
    try {
      const response = await axios.post('/api/process/update', {
        netID: user.netID,
        requestID: selectedRequestID,
        mentorProcessedComments: reason,
        status: Status.REJECTED,
      })

      // Updates the page if the request was successfully rejected so the rejected request should not be seen
      if (response.status === 200) {
        getAdmin()
      }
    } catch (error) {
      if (error instanceof Error) console.log(error.message)
      else if (axios.isAxiosError(error))
        console.log(error.message, error.status)
      else console.log(error)
    }
  }

  function toggleCollapse(projectIndex: number) {
    const newIsOpen = isOpen
    for (let i = 0; i < isOpen.length; i++) {
      if (i === projectIndex) {
        newIsOpen[i] = !newIsOpen[i]
      }
    }
    setIsOpen(newIsOpen)
  }

  return (
    <>
      <Row className='my-4'>
        <h1>Welcome back {user && user.firstName}</h1>
      </Row>
      {/* Creates the ProjectHeader  */}
      {projects.map((project, projIndex) => {
        return (
          <Row key={projIndex}>
            <ProjectHeader
              projectName={project.projectTitle}
              expenses={project.totalExpenses}
              available={Prisma.Decimal.sub(
                project.startingBudget,
                project.totalExpenses
              )}
              budgetTotal={project.startingBudget}
              onToggleCollapse={() => {
                toggleCollapse(projIndex)
              }}
              isOpen={isOpen[projIndex]}
            />
            {/* Details of the request forms modeled into cards */}
            {/* These are the request forms associated to its project */}
            <Collapse in={isOpen[projIndex]}>
              <div>
                {projectRequests[projIndex].length > 0 ? (
                  projectRequests[projIndex].map((request, reqIndex) => {
                    return (
                      <AdminRequestCard
                        key={reqIndex}
                        details={request}
                        onReject={() => handleReject(request.requestID)}
                      />
                    )
                  })
                ) : (
                  <p className='my-4'>There are no requests in this project.</p>
                )}
              </div>
            </Collapse>
          </Row>
        )
      })}

      <RejectionModal
        show={showRejectModal}
        onHide={() => setShowRejectModal(false)}
        onSubmit={handleSubmitRejection}
      />

      {/* AN EXAMPLE OF REIMBURSEMENT CARDS */}
      {/* <Row>
        <ProjectHeader
          projectName='Project 3: Point of Nerve Conduction Diagnostic | Capstone, Reimbursement'
          // budget='Budget: $100/$500'
          isOpen={isOpenProject2}
          expenses={0}
          available={0}
          budgetTotal={new Decimal()}
          onToggleCollapse={function (): void {
            throw new Error('Function not implemented.')
          }} // toggleCollapse={toggleCollapseProject2}
        />
        <Collapse in={isOpenProject2}>
          <div>
            <Row>
              <ReimbursementCard />
              <ReimbursementCard />
            </Row>
          </div>
        </Collapse>
      </Row> */}
    </>
  )
}
