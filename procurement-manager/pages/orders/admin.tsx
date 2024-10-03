/**
 * This is the Admin View for the Orders Page
 * This current implementation does not work
 * Unknown reason but possible API error
 */

import React, { useEffect, useState } from 'react'
import { Row, Button, Modal, Form } from 'react-bootstrap'
import AdminRequestCard from '@/components/AdminRequestCard'
import ProjectHeader from '@/components/ProjectHeader'
import ReimbursementCard from '@/components/AdminReimbursementCard'
import { prisma } from '@/db'
import { RequestDetails } from '@/lib/types'
import { Prisma, Project, Status, User, Order } from '@prisma/client'
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
  const [selectedRequestID, setSelectedRequestID] = useState<number | null>(null)
  // state for the requests inside the different projects associated to the user
  const [rejectionReason, setRejectionReason] = useState('')
  const [projectRequests, setProjectRequests] = useState<RequestDetails[][]>(reqs)
  // state for the projects associated to the user
  const [projects, setProjects] = useState<Project[]>(projs)
  const [projectReqsWithOrders, setProjectReqsWithOrders] = useState<RequestDetails[][]>()

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
   * This function is called after the mentor submits the rejection reason through the RejectionModal.
   * @param reason - The reason for rejecting the request.
   */
  const handleSubmitRejection = async () => {
    setShowRejectModal(false)
    try {
      const response = await axios.post('/api/process/update', {
        netID: user.netID,
        requestID: selectedRequestID,
        comment: rejectionReason,
        status: Status.REJECTED,
      })

      if (response.status === 200) {
        getAdmin()
      }
    } catch (error) {
      if (error instanceof Error) console.log(error.message)
      else if (axios.isAxiosError(error)) console.log(error.message, error.status)
      else console.log(error)
    }
  }
  /**
   * This function is called after the mentor submits the acceptance
   * BUGGY
   * @param requestID 
   */
  const handleAccept = async (requestID: number) => {
    try {
      const response = await axios.post('/api/request/accept', {
        requestID,
      });
      if (response.status === 200) {
        alert('Request Accepted');
        getAdmin();
      }
    } catch (error) {
      console.error('Error accepting request:', error);
    }
  };


  /**
  * this function is used to retrieve the orders associated with each request in the project, and if a request has an order then the request is processed
  */
  async function getProcessedReqs() {
    try
    {
      let projectReqs: RequestDetails[][] = []
      let reqsWithOrders: RequestDetails[] = []

      for (let projectIndex = 0; projectIndex < projects.length; projectIndex++)
      {
        reqsWithOrders = []
        for (const request of projectRequests[projectIndex]) 
        {
          const response = await axios.get('/api/orders/get/requestOrders/', {
            params: {
              requestID: request.requestID
          }})

          if (response.status === 200) 
          {
            const orders: Order[] = response.data.orders
            if (orders.length !== 0) {
              reqsWithOrders.push(request)
            }
          }
        }
        if (reqsWithOrders.length !== 0) projectReqs.push(reqsWithOrders)
      }
      setProjectReqsWithOrders(projectReqs)
    }
    catch (error) {
      if (error instanceof Error) console.log(error.message)
      else if (axios.isAxiosError(error))
        console.log(error.message, error.status)
      else console.log(error)
    }
  }

  /**
   * this function checks if a request is processed or not (has orders) by using its request ID
   * @param ID the index of the project
   * @param reqID the requestID of the request
   * @returns boolean value depending on the request associated with that ID is processed or not
   */
  function processed (projIndex: number, reqID: number) 
  {
    if (projectReqsWithOrders !== undefined) {
      for (const req of projectReqsWithOrders[projIndex]) {
        if (reqID === req.requestID) return true
      }
    }
    return false
  }


  return (
    <>
      <Row className='my-4'>
        <h1>Welcome back {user && user.firstName}</h1>
      </Row>
      {projects.map((project, projIndex) => {
        return (
          <Row key={projIndex}>
            <ProjectHeader
              projectName={project.projectTitle}
              expenses={project.totalExpenses}
              available={Prisma.Decimal.sub(project.startingBudget, project.totalExpenses)}
              budgetTotal={project.startingBudget}
              onToggleCollapse={() => toggleCards(projIndex)}
              isOpen={isOpen[projIndex]}
            />
            {projectRequests[projIndex].map((request, reqIndex) => {
              return (
                <AdminRequestCard
                  key={reqIndex}
                  user={user}
                  project={project}
                  details={request}
                  onReject={() => handleReject(request.requestID)}
                  onAccept={() => handleAccept(request.requestID)}
                  onSave={() => getAdmin()}
                  collapsed={isOpen[projIndex]}
                />
              )
            })}
          </Row>
        )
      })}
      <Modal show={showRejectModal} onHide={() => setShowRejectModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Reason for Rejection</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Control
            as="textarea"
            rows={3}
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            placeholder="Enter the reason for rejection"
          />
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowRejectModal(false)}>Cancel</Button>
          <Button variant="primary" onClick={handleSubmitRejection}>Submit Rejection</Button>
        </Modal.Footer>
      </Modal>
    </>
  )
}
