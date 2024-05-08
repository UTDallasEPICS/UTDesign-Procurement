/**
 * This is the Admin View for the Orders Page
 */

import React, { useEffect, useState } from 'react'
import { Row } from 'react-bootstrap'
import AdminRequestCard from '@/components/AdminRequestCard'
import ProjectHeader from '@/components/ProjectHeader'
import ReimbursementCard from '@/components/AdminReimbursementCard'
import { prisma } from '@/db'
import { RequestDetails } from '@/lib/types'
import { Prisma, Project, Status, User, Order, RequestItem } from '@prisma/client';
import RejectionModal from '@/components/RejectionModal'
import axios from 'axios'
import { Session, getServerSession } from 'next-auth'
import { authOptions } from '../api/auth/[...nextauth]'
import express from 'express';
import getVendors from '@/components/AdminRequestCard'

const app = express();

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
  const [selectedRequestID, setSelectedRequestID] = useState<number | null>(
    null
  )
  // state for the requests inside the different projects associated to the user
  const [projectRequests, setProjectRequests] =
    useState<RequestDetails[][]>(reqs)
  // state for the projects associated to the user
  const [projects, setProjects] = useState<Project[]>(projs)
  const [projectReqsWithOrders, setProjectReqsWithOrders] = useState<RequestDetails[][]>()

  // Opens all the cards by default
  useEffect(() => {
    getProcessedReqs()
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
    getProcessedReqs()
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

  /**
   * this function is used to retrieve the orders associated with each request in the project, and if a request has an order then the request is processed
   */
  async function getProcessedReqs() {
    try {
      let projectReqs: RequestDetails[][] = []
      let reqsWithOrders: RequestDetails[] = []

      for (let projectIndex = 0; projectIndex < projects.length; projectIndex++) {
        reqsWithOrders = []
        for (const request of projectRequests[projectIndex]) {
          const response = await axios.get('/api/orders/get/requestOrders/', {
            params: {
              requestID: request.requestID
            }
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
  function processed(projIndex: number, reqID: number) {
    if (projectReqsWithOrders !== undefined) {
      for (const req of projectReqsWithOrders[projIndex]) {
        if (reqID === req.requestID) return true
      }
    }
    return false
  }
  const [userData, setUserData] = useState<{
    projName: string;
    id: number;
    vendorName: RequestItem[];
  }[]>([]);
  const [userSearchData, setUserSearchData] = useState<{
    projName: string;
    id: number;
    vendorName: RequestItem[];
  }[]>([]);
  //Set all the states for the variables
  //Use these states to store the json data from the database api calls
  const [vendor, setVendor] = useState('');
  const [status, setStatus] = useState('');
  const [number, setNumber] = useState('');
  const [projectSearch, setProjectSearch] = useState<Project[]>([]);
  const [vendors, setVendors] = useState<RequestItem[]>([]);
  const [projName, setprojName] = useState('');
  const [id, setId] = useState('');
  const [vendorName, setVendorName] = useState('');

  //Using axios to recieve the data from the database api call
  //This function particulary calls the project model to get the list of the projects
  const fetchProjects = async () => {
    try {
      const response = await axios.get('/api/orders/get/requestProjects.ts');
      const data1 = response.data;
      console.log(data1); // Do something with the fetched data
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };
  //Using axios to recieve the data from the database api call
  //This function particulary calls the project requestItem to get the list of the vendor names
  const fetchVendors = async () => {
    try {
      const response = await axios.get('/api/orders/get/requestVendors.ts');
      const data2 = response.data;
      console.log(data2); // Do something with the fetched data
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  //This function searches for the projects and vendor names
  function CustomSearch() {

    //Call the functions that fetch the data
    fetchProjects()
    fetchVendors()

    React.useEffect(() => {

      const fetchData = async () => {
        // setProjectSearch(data1);
        // UT setVendors(data2);

        const vendors = await prisma.requestItem.findMany()
      };

      fetchData();


      //const statusVals = await prisma.process.findMany()
      const data = projects.map(project => ({
        projName: project.projectTitle,
        id: project.projectID,
        vendorName: vendors.filter(requestItem => requestItem.vendorID),
        //statusAns: statusVals.filter(process => process.status)
      }));

      //sets the data from databse to the state
      setUserData(data);
      setUserSearchData(data);
    }, []);
    //filters the data for each category
    const handleSearch = () => {
      const newData =
        userData
          .filter(x => x.projName == (projName == '' ? x.projName : projName))
          .filter(y => y.id == (id == '' ? y.id : id))
      //.filter(z => z.number == (number == '' ? z.number : number))
      setUserSearchData(newData);
    }


    //Front end for the search boxes
    return (
      <div>
        <table>
          <tbody>
            <tr>
              <td>
                <input className="filter" type='text' placeholder="Enter Vendor.." value={vendorName} onChange={(e) => setVendorName(e.target.value)} />
              </td>
              <td>
                <input className="filter" type='text' placeholder="Enter Project Number.." value={id} onChange={(e) => setId(e.target.value)} />
              </td>

              <td>
                <button className="btn-primary" onClick={handleSearch}>Search</button>
              </td>
            </tr>
          </tbody>
        </table>

      </div >
    )
  }

  return (
    <>

      <Row className='my-4'>
        <h1>Welcome back {user && user.firstName}</h1>
      </Row>
      <Row className='searchBar'>
        <CustomSearch />
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
                // toggleProjectCollapse(projIndex)
                toggleCards(projIndex)
              }}
              isOpen={isOpen[projIndex]}
            />
            {/* Details of the request forms modeled into cards */}
            {/* These are the request forms associated to its project */}
            {/* The Collapse below was an old feature that might be used again */}
            {/* <Collapse in={isOpen[projIndex]}> */}
            {/* <div> */}
            {projectRequests[projIndex].length > 0 ? (
              projectRequests[projIndex].map((request, reqIndex) => {
                // TODO:: only show request cards if approved and not processed, works using an if and 'processed' function but resolve rendering issue:
                // i.e. when you open or refresh orders page, it still tries to display the request cards of processed requests, then the cards disappear
                // maybe try getting processed requests and update the request array in getServerSideProps() instead of in the component
                return (
                  <AdminRequestCard
                    key={reqIndex}
                    user={user}
                    project={project}
                    details={request}
                    onReject={() => handleReject(request.requestID)}
                    onSave={() => getAdmin()} // since after adding orders and updating project expenses in AdminRequestCard this function call will show the updated project info after querying DB
                    collapsed={isOpen[projIndex]}
                  />
                )
              })
            ) : (
              <p className='my-4'>There are no requests in this project.</p>
            )}
            {/* </div> */}
            {/* </Collapse> */}
          </Row>
        )
      })}

      <RejectionModal
        show={showRejectModal}
        onHide={() => setShowRejectModal(false)}
        onSubmit={handleSubmitRejection}
      />

      {/* AN EXAMPLE OF REIMBURSEMENT CARDS - not updated */}
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

