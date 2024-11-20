/**
 * This is the Admin View for the Orders Page
 * This current implementation does not work
 * Unknown reason but possible API error
 */

import React, { useEffect, useState } from 'react'
import { Row, Button, Modal, Form } from 'react-bootstrap'
import AdminRequestCard from '@/components/AdminRequestCard'
import ProjectHeader from '@/components/ProjectHeader'
import AdminReimbursementCard from '@/components/AdminReimbursementCard'
import { prisma } from '@/db'
import { RequestDetails } from '@/lib/types'
import { ReimbursementDetails } from '@/lib/types'
import { Prisma, Project, Status, User, Order, RequestItem } from '@prisma/client'
import RejectionModal from '@/components/RejectionModal'
import axios from 'axios'
import { Session, getServerSession } from 'next-auth'
import { authOptions } from '../api/auth/[...nextauth]'
import getVendors from '@/components/AdminRequestCard'


export async function getServerSideProps(context: any) {
  const session = await getServerSession(context.req, context.res, authOptions)
  const user = session?.user as User

  // projects and requests are loaded from the server-side first (I wanted it try it out)
  // These will be passed to a state so if we need to fetch again, we can just update the state

  const projects = await prisma.project.findMany()

  const requestOfMultipleProjects: RequestDetails[][] = []
  const reimbursementsOfMultipleProjects: ReimbursementDetails[][] = []

  
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
    const reimbursements = await prisma.reimbursement.findMany({
      where: {
        projectID: project.projectID,
        Process: {
          some: {
            status: Status.APPROVED
          }
        }
      },
      include: {
        ReimbursementItem: true,
        Process: true,
        project: true,
      },
    })
    reimbursementsOfMultipleProjects.push(reimbursements)
    requestOfMultipleProjects.push(requests)
  }

  return {
    props: {
      session: session,
      user: user,
      // needed to stringify the object first to avoid non-serializable error
      reqs: JSON.parse(JSON.stringify(requestOfMultipleProjects)),
      reims: JSON.parse(JSON.stringify(reimbursementsOfMultipleProjects)),
      projs: JSON.parse(JSON.stringify(projects)),
    },
  }
}

interface AdminProps {
  session: Session | null
  user: User
  reqs: RequestDetails[][]
  reims: ReimbursementDetails[][]
  projs: Project[]
}

export default function Admin({
  session,
  user,
  reqs,
  reims,
  projs,
}: AdminProps): JSX.Element {

  // state for opening the collapsed cards - an array due to multiple projects
  const [isOpen, setIsOpen] = useState<boolean[]>([])

  // state for the modal for rejecting requests
  const [showRejectModal, setShowRejectModal] = useState(false)

  // state to set the request number for the reject modal to show
  const [selectedProcessID, setSelectedProcessID] = useState<number | null>(null)

  // state for the requests inside the different projects associated to the user
  const [projectRequests, setProjectRequests] = useState<RequestDetails[][]>(reqs)
  const [projectReimbursements, setProjectReimbursements] = useState<ReimbursementDetails[][]>([])

  // state for the projects associated to the user
  const [projects, setProjects] = useState<Project[]>(projs)
  const [projectReqsWithOrders, setProjectReqsWithOrders] =
    useState<RequestDetails[][]>()

  // Opens all the cards by default
  useEffect(() => {
    getAdminReimbursements()
    getAdminRequests()
    setIsOpen(projects.map(() => true))
  }, [])

  // Client-side data fetching whenever we need to refetch the data and rerender the page
  /**
   * This function is called when the page needs to be rerendered with the updated data
   * This function calls our api that gets all the projects and their requests with the status of approved
   */
  async function getAdminRequests() {
    const response = await axios.post('/api/request-form/get', {
      email: user.email,
    })
    const [projects, requestsOfMultipleProjects] = await Promise.all([
      response.data.projects,
      response.data.requests,
    ])
    setProjects(projects)
    setProjectRequests(requestsOfMultipleProjects)
    setIsOpen(projects.map(() => true))
  }

  async function getAdminReimbursements() {
    const nextResponse = await axios.post('/api/reimbursement-form/get', {
      netID: user.netID,
    })
    const [reimbursementsOfMultipleProjects] = await Promise.all([
      nextResponse.data.reimbursements
    ])
    setProjectReimbursements(reimbursementsOfMultipleProjects)
  }

  /**
   * This function is called after the admin clicks the reject button on a request.
   * @param requestID - The requestID of the request being rejected.
   */
  const handleReject = (processID: number) => {
    setSelectedProcessID(processID)
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
   * This function is called after the admin submits the rejection reason through the RejectionModal.
   * @param reason - The reason for rejecting the request.
   */
  const handleSubmitRejection = async (reason: string) => {
    setShowRejectModal(false)
    try {
      const response = await axios.post('/api/process/update', {
        email: user.email,
        processID: selectedProcessID,
        comment: reason,
        status: Status.REJECTED,
      })

      if (response.status === 200) {
        getAdminReimbursements()
        getAdminRequests()
      }
    } catch (error) {
      if (error instanceof Error) console.log(error.message)
      else if (axios.isAxiosError(error))
        console.log(error.message, error.status)
      else console.log(error)
    }
  }

  const updateStatus = async (status: string, pID: number) => {
    try {
      const response = await axios.post('/api/process/update', {
        netID: user.netID,
        processID: pID,
        status: status,
      })

      if (response.status === 200) {
        getAdminReimbursements()
        getAdminRequests()
      }
    } catch (error) {
      if (error instanceof Error) console.log(error.message)
      else if (axios.isAxiosError(error))
        console.log(error.message, error.status)
      else console.log(error)
    }
  }
  
  // /**
  //  * This function is called after the mentor submits the acceptance
  //  * BUGGY
  //  * @param requestID
  //  */
  // const handleAccept = async (requestID: number, processID: number) => {
  //   try {
  //     const response = await axios.post('/api/request/accept', {
  //       requestID,
  //       processID,
  //     })
  //     if (response.status === 200) {
  //       alert('Request Accepted')
  //       getAdmin()
  //     }
  //   } catch (error) {
  //     console.error('Error accepting request:', error)
  //   }
  // }

  /**
   * this function is used to retrieve the orders associated with each request in the project, and if a request has an order then the request is processed
   */
  async function getProcessedReqs() {
    try {
      let projectReqs: RequestDetails[][] = []
      let reqsWithOrders: RequestDetails[] = []

      for (
        let projectIndex = 0;
        projectIndex < projects.length;
        projectIndex++
      ) {
        reqsWithOrders = []
        for (const request of projectRequests[projectIndex]) {
          const response = await axios.get('/api/orders/get/requestOrders/', {
            params: {
              requestID: request.requestID,
            },
          })

          if (response.status === 200) {
            const orders: Order[] = response.data.orders
            if (orders.length !== 0) {
              reqsWithOrders.push(request)
            }
          }
        }
        if (reqsWithOrders.length !== 0) projectReqs.push(reqsWithOrders)
      }
      setProjectReqsWithOrders(projectReqs)
    } catch (error) {
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
  function processed(projIndex: number, reqID: number) {
    if (projectReqsWithOrders !== undefined) {
      for (const req of projectReqsWithOrders[projIndex]) {
        if (reqID === req.requestID) return true
      }
    }
    return false
  }

  const [userData, setUserData] = useState<
    {
      projName: string
      id: number
      vendorName: RequestItem[]
    }[]
  >([])

  const [userSearchData, setUserSearchData] = useState<
    {
      projName: string
      id: number
      vendorName: RequestItem[]
    }[]
  >([])

  //Nihita - ***THIS PART OF THE CODE HAS BUGS***
  //Set all the states for the variables
  //Use these states to store the json data from the database api calls
  const [vendor, setVendor] = useState('')
  const [status, setStatus] = useState('')
  const [number, setNumber] = useState('')
  const [projectSearch, setProjectSearch] = useState<Project[]>([])
  const [vendors, setVendors] = useState<RequestItem[]>([])
  const [projName, setprojName] = useState('')
  const [id, setId] = useState('')
  const [vendorName, setVendorName] = useState('')

  //Using axios to recieve the data from the database api call
  //This function particulary calls the project model to get the list of the projects
  const fetchProjects = async () => {
    try {
      const response = await axios.get('/api/project')
      const data1 = response.data
      console.log(data1) // Do something with the fetched data
    } catch (error) {
      console.error('Error fetching data:', error)
    }
  }
  //Using axios to recieve the data from the database api call
  //This function particulary calls the project requestItem to get the list of the vendor names
  const fetchVendors = async () => {
    try {
      const response = await axios.get('/api/vendor/get')
      const data2 = response.data
      console.log(data2) // Do something with the fetched data
    } catch (error) {
      console.error('Error fetching data:', error)
    }
  }

  //This function searches for the projects and vendor names
  function CustomSearch() {
    //Call the functions that fetch the data
    fetchProjects()
    fetchVendors()

    React.useEffect(() => {
      const fetchData = async () => {
        // setProjectSearch(data1);
        // UT setVendors(data2);
        // const vendors = await prisma.requestItem.findMany()
      }

      fetchData()

      //Get the particular values from the models
      const data = projects.map((project) => ({
        projName: project.projectTitle,
        id: project.projectID,
        vendorName: vendors.filter((requestItem) => requestItem.vendorID),
        //statusAns: statusVals.filter(process => process.status)
      }))

      //sets the data from databse to the state
      setUserData(data)
      setUserSearchData(data)
    }, [])
    //filters the data for each category
    const handleSearch = () => {
      const newData = userData
        .filter((x) => x.projName == (projName == '' ? x.projName : projName))
        .filter((y) => y.id == (id == '' ? y.id : id))
      //.filter(z => z.number == (number == '' ? z.number : number))
      setUserSearchData(newData)
    }

    //Front end for the search boxes
    return (
      <div>
        <table>
          <tbody>
            <tr>
              <td>
                <input
                  className='filter'
                  type='text'
                  placeholder='Enter Vendor..'
                  value={vendorName}
                  onChange={(e) => setVendorName(e.target.value)}
                />
              </td>
              <td>
                <input
                  className='filter'
                  type='text'
                  placeholder='Enter Project Number..'
                  value={id}
                  onChange={(e) => setId(e.target.value)}
                />
              </td>

              <td>
                <button className='btn-primary' onClick={handleSearch}>
                  Search
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    )
  }
  //This is the end of the bug
  return (
    <>
      <Row className='my-4'>
        <h1>Welcome back {user && user.firstName}</h1>
      </Row>
      <Row className='searchBar'>{/* <CustomSearch /> */}</Row>
      {/* Creates the ProjectHeader  */}
      {projects.map((project, projIndex) => {
        return (
          <Row key={projIndex}>
            <ProjectHeader
              projectName={project.projectTitle}
              expenses={project.totalExpenses}
              available={Prisma.Decimal.sub(
                project.startingBudget,
                project.totalExpenses,
              )}
              budgetTotal={project.startingBudget}
              onToggleCollapse={() => toggleCards(projIndex)}
              isOpen={isOpen[projIndex]}
            />
            {projectRequests[projIndex]?.length > 0 ? (
              projectRequests[projIndex].map((request, reqIndex) => {
                return (
                  <AdminRequestCard
                    key={reqIndex}
                    user={user}
                    project={project}
                    details={request}
                    onReject={() => handleReject(request.Process[0].processID)}
                    setStatusOrdered={() => updateStatus(Status.ORDERED, request.Process[0].processID)}
                    setStatusReceived={() => updateStatus(Status.DELIVERED, request.Process[0].processID)}
                    onSave={() => getAdminRequests()}
                    collapsed={isOpen[projIndex]}
                  />
                )
              })
            ) : (
              <p className='my-4'>There are no procurement requests in this project.</p>
            )}
            
            {projectReimbursements[projIndex]?.length > 0 ? (
              projectReimbursements[projIndex].map((reimbursement, reimIndex) => {
                return (
                  <AdminReimbursementCard
                    key={reimIndex}
                    user={user}
                    project={project}
                    details={reimbursement}
                    onReject={() => handleReject(reimbursement.Process[0].processID)}
                    onSave={() => getAdminReimbursements()} 
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

