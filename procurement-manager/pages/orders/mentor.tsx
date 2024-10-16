/**
 * This is the mentor view in the Orders Page
 */

import React, { useEffect, useState } from 'react'
import { Row } from 'react-bootstrap'
import MentorRequestCard from '@/components/MentorRequestCard'
import MentorReimburseCard from '@/components/MentorReimbursementCard'
import ProjectHeader from '@/components/ProjectHeader'
import RejectionModal from '@/components/RejectionModal'
import { Prisma, Project, Status, User } from '@prisma/client'
import axios from 'axios'
import { ReimbursementDetails, RequestDetails } from '@/lib/types'
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

  const [selectedReimbursementID, setSelectedReimbursementID] = useState<number | null>(
    null
  )

  // state for the requests inside the different projects associated to the user
  const [projectRequests, setProjectRequests] = useState<RequestDetails[][]>([])
  const [projectReimbursements, setProjectReimbursements] = useState<ReimbursementDetails[][]>([])

  // state for the projects associated to the user
  const [projects, setProjects] = useState<Project[]>([])

  useEffect(() => {
    getMentorReimbursements()
    getMentorRequests()
  }, [])

  // Client-side data fetching whenever we need to refetch the data and rerender the page but can be done in getServerSideProps
  /**
   * This function is called when the page needs to be rerendered with the updated data
   * This function calls our api that gets all projects associated to the user and their requests with the status of UNDER_REVIEW
   */
  async function getMentorRequests() {
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

  async function getMentorReimbursements() {
    const nextResponse = await axios.post('/api/reimbursement-form/get', {
      netID: user.netID,
    })
    const [reimbursementsOfMultipleProjects] = await Promise.all([
      nextResponse.data.reimbursements
    ])
    setProjectReimbursements(reimbursementsOfMultipleProjects)
    console.log('reimbursement (Student)', reimbursementsOfMultipleProjects)
    console.log('setReimbursement (Student)', projectReimbursements)
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
  const handleReject = (ReqID: number | null, ReimID: number | null) => {
    setSelectedRequestID(ReqID)
    setSelectedReimbursementID(ReimID)
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
        reimbursementID: selectedReimbursementID,
        comment: reason,
        status: Status.REJECTED,
      })

      // Updates the page if the request was successfully rejected so the rejected request should not be seen
      if (response.status === 200) {
        getMentorReimbursements()
        getMentorRequests()
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
  async function handleApproveRequest(requestID: number) {
    try {
      const res = await axios.post('/api/process/update', {
        netID: user.netID,
        requestID: requestID,
        comment: 'Approved',
        status: Status.APPROVED,
      })

      // Updates the page if the request was successfully approved so the approved request should not be seen
      if (res.status === 200) {
        getMentorReimbursements()
        getMentorRequests()
      }
    } catch (error) {
      if (error instanceof Error) console.error(error.message)
      else if (axios.isAxiosError(error))
        console.error(error.message, error.status)
      else console.error(error)
    }
  }

  async function handleApproveReimbursement(reimbursementID: number) {
    try {
      const res = await axios.post('/api/process/update', {
        netID: user.netID,
        reimbursementID: reimbursementID,
        comment: 'Approved',
        status: Status.APPROVED,
      })

      // Updates the page if the request was successfully approved so the approved request should not be seen
      if (res.status === 200) {
        getMentorReimbursements()
        getMentorRequests()
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
              }
              isOpen={isOpen[projIndex]}
            />
            
            {/* RENDERS THE REQUESTS ASSOCIATED TO THE PROJECT THE MENTOR IS IN */}
            {projectRequests[projIndex].length > 0 ? (
              projectRequests[projIndex].map((request, reqIndex) => (
                <MentorRequestCard
                  details={request}
                  key={reqIndex}
                  {...request}
                  onReject={() => handleReject(request.requestID, null)}
                  onApprove={() => handleApproveRequest(request.requestID)}
                  collapsed={isOpen[projIndex]}
                />
              ))
            ) : (
              <p className='my-4'>There are no requests in this project.</p>
            )}
            
            {/* RENDERS THE REIMBURSEMENTS ASSOCIATED TO THE PROJECT THE MENTOR IS IN */}
            {projectReimbursements[projIndex]?.length > 0 ? (
              projectReimbursements[projIndex].map((reimbursement, reimIndex) => {
                return (
                  //console.log('projectReimbursements:: ', projectReimbursements),
                  <MentorReimburseCard
                    details={reimbursement}
                    key={reimIndex}
                    {...reimbursement}
                    onReject={() => handleReject(null, reimbursement.reimbursementID)}
                    onApprove={() => handleApproveReimbursement(reimbursement.reimbursementID)}
                    collapsed={isOpen[projIndex]}
                  />
                )
              })
            ) : (
              <p className='my-4'>There are no reimbursement requests in this project.</p>
            )}
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
