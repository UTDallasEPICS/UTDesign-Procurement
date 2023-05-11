import React, { useEffect, useState } from 'react'
import { Row, Collapse } from 'react-bootstrap'
import MentorRequestCard from '@/components/MentorRequestCard'
import ProjectHeader from '@/components/ProjectHeader'
import RejectionModal from '@/components/RejectionModal'
import { Prisma, Project, Status, User } from '@prisma/client'
import axios from 'axios'
import { RequestDetails } from '@/lib/types'
import { Session, getServerSession } from 'next-auth'
import { authOptions } from '../api/auth/[...nextauth]'

export async function getServerSideProps(context: any) {
  const session = await getServerSession(context.req, context.res, authOptions)
  const user = session?.user as User
  return {
    props: {
      session: session,
      user: user,
    },
  }
}

interface MentorProps {
  session: Session | null
  user: User
}

export default function Mentor({ session, user }: MentorProps) {
  // state for opening the collapsed cards - an array due to multiple projects
  const [isOpen, setIsOpen] = useState<boolean[]>([])
  // state for the modal for rejecting requests
  const [showRejectModal, setShowRejectModal] = useState(false)
  // state to set the request number for the reject modal to show
  const [selectedRequestID, setSelectedRequestID] = useState<number | null>(
    null
  )
  // state for the requests inside the different projects associated to the user
  const [projectRequests, setProjectRequests] = useState<RequestDetails[][]>([])
  // state for the projects associated to the user
  const [projects, setProjects] = useState<Project[]>([])

  useEffect(() => {
    getMentor()
  }, [])

  // Client-side data fetching, but can be done with getServerSideProps
  async function getMentor() {
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
   * This was a feature where clicking the hide/show button in ProjectHeader
   * would instead hide all the requests for the project.
   * @param projectIndex - The index of the project in the projects array.
   */
  const toggleProjectCollapse = (projectIndex: number) => {
    setIsOpen((prevOpen) => {
      const newOpen = [...prevOpen]
      newOpen[projectIndex] = !newOpen[projectIndex]
      return newOpen
    })
  }

  /**
   * This is the feature where clicking the hide/show button in ProjectHeader
   * would show the details of each request in the project
   * @param projectIndex - The index of the project in the projects array.
   */
  const toggleCards = (projectIndex: number) => {
    setIsOpen((prevOpen) => {
      const newOpen = [...prevOpen]
      newOpen[projectIndex] = !newOpen[projectIndex]
      return newOpen
    })
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
        comment: reason,
        status: Status.REJECTED,
      })

      // Updates the page if the request was successfully rejected so the rejected request should not be seen
      if (response.status === 200) {
        getMentor()
      }
    } catch (error) {
      if (error instanceof Error) console.log(error.message)
      else if (axios.isAxiosError(error))
        console.log(error.message, error.status)
      else console.log(error)
    }
  }

  /**
   * This function is called when the mentor clicks the approve button on a request.
   * @param requestID - The requestID of the request being approved.
   */
  async function handleApprove(requestID: number) {
    setSelectedRequestID(requestID)
    try {
      const res = await axios.post('/api/process/update', {
        netID: user.netID,
        requestID: selectedRequestID,
        comment: 'Approved',
        status: Status.APPROVED,
      })

      // Updates the page if the request was successfully approved so the approved request should not be seen

      if (res.status === 200) {
        getMentor()
      }
    } catch (error) {
      if (error instanceof Error) console.error(error.message)
      else if (axios.isAxiosError(error))
        console.error(error.message, error.status)
      else console.error(error)
    }
  }

  return (
    <>
      <Row className='my-4'>
        <h1>Welcome back {user && user.firstName}</h1>
      </Row>

      {/* RENDERS THE PROJECTS ASSOCIATED TO MENTOR */}
      {projects.map((project, projIndex) => {
        return (
          <Row className='big-row my-4' key={projIndex}>
            <ProjectHeader
              projectName={project.projectTitle}
              expenses={project.totalExpenses}
              available={Prisma.Decimal.sub(
                project.startingBudget,
                project.totalExpenses
              )}
              budgetTotal={project.startingBudget}
              onToggleCollapse={
                () => toggleCards(projIndex)
                // toggleProjectCollapse(projIndex)
              }
              isOpen={isOpen[projIndex]}
            />
            {/* <Collapse in={isOpen[projIndex]}>
              <div> */}
            {/* RENDERS THE REQUESTS ASSOCIATED TO THE PROJECT THE MENTOR IS IN */}
            {projectRequests[projIndex].length > 0 ? (
              projectRequests[projIndex].map((request, reqIndex) => (
                <MentorRequestCard
                  details={request}
                  key={reqIndex}
                  {...request}
                  onReject={() => handleReject(request.requestID)}
                  onApprove={() => handleApprove(request.requestID)}
                  collapsed={isOpen[projIndex]}
                />
              ))
            ) : (
              <p className='my-4'>There are no requests in this project.</p>
            )}
            {/* </div>
            </Collapse> */}
          </Row>
        )
      })}
      <RejectionModal
        show={showRejectModal}
        onHide={() => setShowRejectModal(false)}
        onSubmit={handleSubmitRejection}
      />
    </>
  )
}
