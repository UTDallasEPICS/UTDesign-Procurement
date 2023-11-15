/**
 * This is the Admin View for the Orders Page
 */

import React, { useEffect, useState } from 'react'
import { Row } from 'react-bootstrap'
import AdminProjectCard from '@/components/AdminProjectCard'
import ProjectPageHeader from '@/components/ProjectPageHeader'
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
        projectID: project.projectID, // returns all requests regardless of status
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

  return {
    props: {
      session: session,
      user: user,
      // needed to stringify the object first to avoid non-serializable error
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
  // state for opening the collapsed cards - an array due to multiple projects
  const [isOpen, setIsOpen] = useState<boolean[]>([])
  // state for the modal for rejecting requests
  const [showRejectModal, setShowRejectModal] = useState(false)
  // state to set the request number for the reject modal to show
  const [selectedRequestID, setSelectedRequestID] = useState<number | null>(
    null
  )
  // state for the requests inside the different projects associated to the user
  const [projectRequests, setProjectRequests] =
    useState<RequestDetails[][]>(reqs)
  // state for the projects associated to the user
  const [projects, setProjects] = useState<Project[]>(projs)

  // Opens all the cards by default
  useEffect(() => {
    setIsOpen(projects.map(() => true))
  }, [])

  // Client-side data fetching whenever we need to refetch the data and rerender the page
  /**
   * This function is called when the page needs to be rerendered with the updated data
   * This function calls our api that gets all the projects and their requests with the status of approved
   */
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
        comment: reason,
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

  /**
   * This was a feature where clicking the hide/show button in ProjectHeader
   * would instead hide all the requests for the project. - May not be needed
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

  return (
    <>
      <Row className='my-4'>
        <h1>Welcome back to Project Page, {user && user.firstName}</h1>
      </Row>
      {/* Creates the ProjectHeader  */}
      {projects.map((project, projIndex) => 
      {
        return (
          <Row key={projIndex}>
            <ProjectPageHeader
              projectID={project.projectID}
              onToggleCollapse={() => {
                // toggleProjectCollapse(projIndex)
                toggleCards(projIndex)
              }}
              isOpen={isOpen[projIndex]}
            />
            <AdminProjectCard
            project={project}
            requests={projectRequests}
            collapsed={isOpen[projIndex]}
            />
          </Row>
        )
      }
      )
      }
    </>
  )
}
