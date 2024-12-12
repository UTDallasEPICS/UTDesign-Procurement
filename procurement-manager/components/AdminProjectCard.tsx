/**
 * This component is the card displayed for each project that the Admin will see in the Projects & Order History Page
 */
import React, { useEffect, useState } from 'react'
import { prisma } from '@/db'
import { RequestDetails } from '@/lib/types'
import {
  Row,
  Col,
  Card,
  Button,
  Table,
  Form,
  InputGroup,
  Collapse,
} from 'react-bootstrap'
import styles from '@/styles/RequestCard.module.scss'
import { Prisma, User, Project, WorksOn, Status, Order } from '@prisma/client'
import axios from 'axios'

const MAX_STUDENTS = 6;

interface AdminProjectCardProps {
  projectIndex: number
  project: Project
  requests: RequestDetails[][]
  collapsed: boolean
}

const AdminProjectCard: React.FC<AdminProjectCardProps> = ({
  projectIndex,
  project,
  requests,
  collapsed,
}) => {

  const [collapse, setCollapse] = useState<boolean | undefined>(false)
  const [editable, setEditable] = useState<boolean>(false) // state for editing the request details
  // arrays used to store information from API for mentors and students currently working on the project
  const [mentorArr, setMentorArr] = useState<User[]>([])
  const [studentArr, setStudentArr] = useState<User[]>([])

  // get current mentors and students by default
  useEffect(() => {
    getProjectMembers()
    getProcessedReqs()
  }, [])

  // show cards by default, and rerenders everytime collapse state's value changes
  useEffect(() => {
    setCollapse(collapsed)
  }, [collapsed])

  const [projectNumber, setProjectNumber] = useState(project.projectNum); // sets the project number to the project number of the project passed in to the project card
  const [projectTitle, setProjectTitle] = useState(project.projectTitle);
  const [totalBudget, setTotalBudget] = useState(project.startingBudget);
  const [remainingBudget, setRemainingBudget] = useState(Prisma.Decimal.sub(project.startingBudget, project.totalExpenses)); // subtract values of decimal data type
  const [mentors, setMentors] = useState<string[]>([""])
  const [students, setStudents] = useState<string[]>([""])
  // arrays are used track which of the mentors and studentsthat were edited by admin before saving
  const [updatedMentors, setUpdatedMentors] = useState<boolean[]>([false]) 
  const [updatedStudents, setUpdatedStudents] = useState<boolean[]>([false])
  const [reqIDs, setReqIDs] = useState<number[]>([]) // track which of the requests in the project were edited by admin using request IDs of those updated requests
  const [itemIDs, setItemIDs] = useState<number[][]>(
    requests[projectIndex].map((request) => {
      return []
    })
  ) // track which items in each request were edited by admin
  const [processedReqs, setProcessedReqs] = useState<RequestDetails[]>([]) // track which of the approved requests have orders, i.e. are completed so they are displayed
  const [requestOrders, setRequestOrders] = useState<Order[][]>([]) // stores the orders for each request in the project

  // state that contains the values of the input fields for items for each request of the project
  // TODO:: implement add/delete items feature similar to add/delete items feature for request-form/index.ts
  const [items, setItems] = useState(
    requests[projectIndex].map((request) => {
      return request.RequestItem.map((item) => {
      return { 
        ...item 
        }
      })
    })
  )

  // state that contains the values of the fields for each order
  // TODO:: use requestOrders array to set the orders array so that it shows the orders in each request before editing
  // TODO:: use orders array to implement editing for order data similar AdminRequestCard except updating
  // TODO:: implement add/delete orders feature similar to add/delete items feature for request-form/index.ts
  const [orders, setOrders] = useState(
      requests[projectIndex].map((request) => {
        return [
          {
            orderNumber: '',
            trackingInfo: '',
            orderDetails: '',
            shippingCost: new Prisma.Decimal(0),
          }
        ]
      }
    )
  )

  // sets default values based on existing works on user info from getProjectMembers() and rerenders as data fetched from that function changes
  useEffect(() => {
    let newMentors = mentorArr.map((mentor) => {
      return (mentor.firstName + " " + mentor.lastName)
    })

    // add empty values if less mentors added to project (like if max mentors is 2)
    while (newMentors.length < 2) {
      newMentors.push("")
    }
    setMentors(newMentors)
    setUpdatedMentors(
      newMentors.map((mentor) => {
        return false // initially sets update status of users to false since user data was just retrieved
      })
    )
  }, [mentorArr]) 

  // sets default values based on existing works on user info from getProjectMembers() and rerenders as data fetched from that function changes
  useEffect(() => {
    let newStudents = studentArr.map((student) => {
      return (student.firstName + " " + student.lastName)
    })

    // add empty values if less students added to project (like if max students is 3)
    while (newStudents.length < MAX_STUDENTS) {
      newStudents.push("")
    }
    setStudents(newStudents)
    setUpdatedStudents(
      newStudents.map((student) => {
        return false // initially sets update status to false since the user data was just retrieved
      })
    )
  }, [studentArr])

  /**
   * this function is used to retrieve current users in a project using the currentUsers worksOn API and updates the mentor and student arrays
   * containing initial project users
   */
  async function getProjectMembers() {
    let mentors: User[] = []
    let students: User[] = []
    
    try {
      const response = await axios.get('/api/worksOn/currentUsers/', {
        params: {
          projectID: project.projectID
      }})
      if (response.status === 200) {
        const users: User[] = response.data.worksOnUsers

        for (let i = 0; i < users.length; i++) {
            console.log("user " + users[i].userID + ": " + users[i].firstName + ", role: " + users[i].roleID)

            if (users[i].roleID === 2) {
              mentors.push(users[i]) // updates user arrays based on role
            }
            else if (users[i].roleID === 3) {
              students.push(users[i])
          }
        }
        setMentorArr(mentors) // set current users arrays for mentors and students after going through all users
        setStudentArr(students)
        console.log("updated project members")
      }
    }
    catch (error) {
      if (error instanceof Error) console.log(error.message)
      else if (axios.isAxiosError(error))
        console.log(error.message, error.status)
      else console.log(error)
    }
  }

  /**
   * this function is used to retrieve the orders associated with each request in the project, and if a request has an order then the request is processed
   */
  async function getProcessedReqs() {
    try
    {
      let reqsWithOrders: RequestDetails[] = []
      let reqOrders: Order[][] = []

      for (const request of requests[projectIndex]) {
        const response = await axios.get('/api/orders/get/requestOrders/', {
          params: {
            requestID: request.requestID
        }})

        if (response.status === 200) 
        {
          const orders: Order[] = response.data.orders
          if (orders.length !== 0) {
            reqsWithOrders.push(request)
            reqOrders.push(orders)
          }
        }
      }
      setProcessedReqs(reqsWithOrders)
      setRequestOrders(reqOrders)
      console.log("fetched processed requests")
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
   * @param ID the request ID of the request
   * @returns boolean value depending on the request associated with that ID is processed or not
   */
  function processed (ID: number) 
  {
    for (const req of processedReqs) {
      if (req.requestID === ID) {
        return true
      }
    }
    return false
  }

  /**
   * these functions modify the updated mentors/students array to track the update status of a user based on admin input
   * @param index index of the mentors/students array (same index for updated mentors/students boolean array since same length)
   * @param value boolean value depending on if updated or not
   */
  const updateMentorAtIndex = (index: number, value: boolean) => {
    const newUpdatedMentors = [...updatedMentors];
    newUpdatedMentors[index] = value; // Update the value at the specified index
    setUpdatedMentors(newUpdatedMentors); // Set the state with the new array
  };

  const updateStudentAtIndex = (index: number, value: boolean) => {
    const newUpdatedStudents = [...updatedStudents];
    newUpdatedStudents[index] = value; // Update the value at the specified index
    setUpdatedStudents(newUpdatedStudents); // Set the state with the new array
  };

  /**
   * these functions update the mentor and student input arrays with new values entered by admin
   * @param newMentor stores name of mentor/student that was added by admin
   * @param mentorIndex stores index of mentor/student array that the edited field corresponds to
   */
  function handleMentorChange (newMentor: string, mentorIndex: number) 
  {
    const newMentors = mentors
    newMentors[mentorIndex] = newMentor
    setMentors(newMentors)
    updateMentorAtIndex(mentorIndex, true)
  }

  function handleStudentChange (newStudent: string, studentIndex: number) 
  {
    const newStudents = students
    newStudents[studentIndex] = newStudent
    setStudents(newStudents)
    updateStudentAtIndex(studentIndex, true)
  }
  /**
   * This function handles changes to inputs whenever user is editing the input fields in the request card
   * @param e - the onChange event passed by the input field
   * @param itemIndex - the index of the request item the input field is in within the request items array
   * @param requestIndex - index of the request that the items are in
   * @param details - object holding request that the items are in and other related info
   */

  function handleItemChange(
    e: React.ChangeEvent<HTMLInputElement>,
    itemIndex: number,
    requestIndex: number,
    details: RequestDetails
  ) {
    const { name, value } = e.target

    setItems((prevRequestItemList) => {
      return prevRequestItemList.map((reqItems, reqItemsIndex) => {
        if (reqItemsIndex !== requestIndex) return reqItems
        return reqItems.map((item, i) => {
          if (i !== itemIndex) return item
          updateItemIDs(requestIndex, item.itemID) // add itemID to list if index matches updated item index
          return {
            ...item,
            [name]: value, // only modify item at index with admin entered value for that input field name
          }
        })
      })
    })
    updateReqIDs(details.requestID) // add the request ID of the request that the items are in to updated request IDs
  }

  /**
   * this function adds a request ID for any updated request data to the list of updated request IDs
   * @param value request ID for request data that admin edited
   */
  const updateReqIDs = (value: number) => {
    const storeReqIDs = [...reqIDs]
    storeReqIDs.push(value) // add new value to array
    setReqIDs(storeReqIDs) // Set the state with the updated array
  };

  /**
   * this function adds a item ID for any updated request data to the list of updated item IDs
   * @param requestIndex request index for the item edited
   * @param itemID item ID for request data that admin edited
   */
  const updateItemIDs = (requestIndex: number, itemID: number) => {
    let storeReqItemIDs = [...itemIDs] // stores item update status for all requests, and then go to specific request
    let storeItemIDs = storeReqItemIDs[requestIndex] 
    if (storeItemIDs === undefined || storeItemIDs.length === 0) {
      storeItemIDs = []
    }
    storeItemIDs.push(itemID) 
    storeReqItemIDs[requestIndex] = storeItemIDs // update the list for all requests
    setItemIDs(storeReqItemIDs) 
  };

  /**
   * this function calculates the total cost for all items in a request
   * @param reqIndex index of request to calculate total item cost for
   * @returns Prisma Decimal value for total request expenses
   */
  const calculateTotalCost = (reqIndex: number): Prisma.Decimal => {
    let totalCost = 0
    items[reqIndex].forEach((item) => {
      totalCost += (Number(item.unitPrice) * item.quantity)
    })
    return new Prisma.Decimal(totalCost);
  }

  // TODO:: add form validation to make sure input values follow requirements (no characters for numeric values, etc.)
  // use this as reference: https://react-bootstrap.netlify.app/docs/forms/validation/
  // TODO:: add editable field for otherExpenses for a request

  /**
   * This function handles saving the changes made to the project card (project, project member, and project request data) by calling the APIs 
   * for project update, worksOn deactivate (to remove a user from project), worksOn (to add a new user), and request update
   */
  async function handleSave() 
  {
    setEditable(false)

    try {
      let projectRes = await axios.post('/api/project/update', {
        projectID: Number(project.projectID),
        projectNum: Number(projectNumber),
        projectTitle: String(projectTitle),
        startingBudget: Number(totalBudget),
      })
      if (projectRes.status === 200) {
        console.log("updated project info")
        console.log(projectRes.data)
      }
      let newProject: Project = projectRes.data.project
      project = newProject
      let userRes, worksOnRes, worksOns: WorksOn[], projectWorksOn: WorksOn[], deactivateRes

      console.log("array of update status")
      for (let i = 0; i < mentors.length; i++) {
        console.log("update status of mentor " + (i + 1) + " : " + mentors[i])
      }
      for (let i = 0; i < students.length; i++) {
        console.log("update status of student " + (i + 1) + " : \"" + students[i] + "\"")
      }
      
      for (let mentorIndex = 0; mentorIndex < mentors.length; mentorIndex++) 
      {
        if (updatedMentors[mentorIndex] === true)
        {
          const oldMentorName = mentorIndex < mentorArr.length ? mentorArr[mentorIndex].firstName + " " + mentorArr[mentorIndex].lastName : "";
          const newMentorName = mentors[mentorIndex];

          if (oldMentorName != newMentorName) {
            // mentor names don't match, so remove old mentor (if present) and add new mentor (if present)
            if (oldMentorName) {
              worksOnRes = await axios.get('/api/worksOn/currentProjects/', {
                params: {
                  userID: mentorArr[mentorIndex].userID,
                },
              })
              if (worksOnRes.status === 200) {
                // first get worksOn entry to access start date, then deactivate initial user
                console.log('found current projects of mentor')
                console.log(worksOnRes.data)
              }
              worksOns = worksOnRes.data.worksOn
              projectWorksOn = worksOns.filter(
                (worksOn) => worksOn.projectID === project.projectID,
              )

              deactivateRes = await axios.post('/api/worksOn/deactivate/', {
                email: mentorArr[mentorIndex].email,
                projectNum: newProject.projectNum,
                startDate: projectWorksOn[0].startDate,
              })
              if (deactivateRes.status === 200) {
                console.log('deactivated mentor')
                console.log(deactivateRes.data)
              }
            }
            if (newMentorName.length > 1) {
              const [firstName, lastName] = mentors[mentorIndex].split(' ', 1) // extract 2 values since first name and last name are separated by a space
              userRes = await axios.post('/api/user/get/fullName', {
                firstName,
                lastName,
              })
              if (userRes.status === 200) {
                // first validate the entered user then add to project
                console.log('found new user entered as mentor')
                console.log(userRes.data)
              } else {
                throw new Error('Could not find mentor')
              }
              worksOnRes = await axios.post('/api/worksOn/', {
                email: userRes.data.user.email,
                projectNum: newProject.projectNum,
              })
              if (worksOnRes.status === 201) {
                console.log('added new user as mentor')
                console.log(worksOnRes.data)
              } else {
                throw new Error('Could not add worksOn relation')
              }
            }
          }
        }
      }

      for (let studentIndex = 0; studentIndex < students.length; studentIndex++) 
      {
        if (updatedStudents[studentIndex] === true)
        {
          const oldStudentName = studentIndex < studentArr.length ? studentArr[studentIndex].firstName + " " + studentArr[studentIndex].lastName : "";
          const newStudentName = students[studentIndex];

          if (oldStudentName != newStudentName) {
            // student names don't match, so remove old student (if present) and add new student (if present)
            if (oldStudentName) {
              worksOnRes = await axios.get('/api/worksOn/currentProjects/', {
                params: {
                  userID: studentArr[studentIndex].userID,
                },
              })
              if (worksOnRes.status === 200) {
                // first get worksOn entry to access start date, then deactivate initial user
                console.log('found current projects of student')
                console.log(worksOnRes.data)
              }
              worksOns = worksOnRes.data.worksOn
              projectWorksOn = worksOns.filter(
                (worksOn) => worksOn.projectID === project.projectID,
              )

              deactivateRes = await axios.post('/api/worksOn/deactivate/', {
                email: studentArr[studentIndex].email,
                projectNum: newProject.projectNum,
                startDate: projectWorksOn[0].startDate,
              })
              if (deactivateRes.status === 200) {
                console.log('deactivated student')
                console.log(deactivateRes.data)
              }
            }
            if (newStudentName.length > 1) {
              const [firstName, lastName] = students[studentIndex].split(' ', 1) // extract 2 values since first name and last name are separated by a space
              userRes = await axios.post('/api/user/get/fullName', {
                firstName,
                lastName,
              })
              if (userRes.status === 200) {
                // first validate the entered user then add to project
                console.log('found new user entered as student')
                console.log(userRes.data)
              } else {
                throw new Error('Could not find student')
              }
              worksOnRes = await axios.post('/api/worksOn/', {
                email: userRes.data.user.email,
                projectNum: newProject.projectNum,
              })
              if (worksOnRes.status === 201) {
                console.log('added new user as student')
                console.log(worksOnRes.data)
              } else {
                throw new Error('Could not add worksOn relation')
              }
            }
          }
        }
      }
      getProjectMembers() // update current users arrays for students and mentors after adding/removing
      setUpdatedMentors([]) // reset edit statuses to false since after save, resets to none have been edited yet
      setUpdatedStudents([])
    }
    catch (error) {
      console.log(error)
      if (axios.isAxiosError(error) || error instanceof Error)
        console.error(error.message)
      else console.error(error)
    }

    requests[projectIndex].map((details, reqIndex) => {
      try {
        const newDetails = {
          ...details, // copy the details object
          RequestItem: items[reqIndex], // replace the RequestItem array with the new inputs in each request item
        }
        let isUpdatedReq: boolean = false
        for (const id of reqIDs) {
          if (details.requestID === id) {
            isUpdatedReq = true
            console.log("updated request: " + details.requestID)
          }
        }
        if (isUpdatedReq) {
          let updatedItemArr = []

          for (let i = 0; i < newDetails.RequestItem.length; i++) {
            for (const id of itemIDs[reqIndex]) {
              if (newDetails.RequestItem[i].itemID === id) {
                updatedItemArr.push(newDetails.RequestItem[i])
                console.log("updated item id: ", newDetails.RequestItem[i].itemID)
              }
            }
          }
          // only sending updated items and the edited data types to API
          const itemsToSend = updatedItemArr.map((item) => {
            return {
              itemID: item.itemID,
              description: item.description,
              url: item.url,
              partNumber: item.partNumber,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              vendorID: item.vendorID
            }
          })
          updateRequest(details, itemsToSend)
        }
      } catch (error) {
        if (axios.isAxiosError(error) || error instanceof Error)
          console.error(error.message)
        else console.log(error)
      }
    })
    setRemainingBudget(Prisma.Decimal.sub(project.startingBudget, project.totalExpenses))
    setReqIDs([]) // reset list of updated request IDs to empty since after save, resets to none have been edited yet
    setItemIDs([]) // reset list to none edited once done
  }

  /**
   * this function updates items for the updated request
   * @param details object holding old data of updated request
   * @param itemsToSend object holding new data of updated items in request
   */
  async function updateRequest(details: RequestDetails, itemsToSend: {}[]) {
    const res = await axios.post('/api/request-form/update', {
      projectID: project.projectID,
      requestID: details.requestID,
      items: itemsToSend
      // totalExpenses: calculateTotalCost(reqIndex) // not updating total expenses now since need to add update order (shipping cost) that will affect project expenses
      // since updating project expenses will subtract old expenses (including old order expenses) and add new expenses passed in
    })
    if (res.status === 200) console.log(res.data)
  }

  return (
    <Row className='mb-4'>
      <Col>
        <Card style={{ backgroundColor: '#f8f9fa' }}>
          <Card.Body>
            {/* UNCOLLAPSED ROW */}
            <Form className={styles.requestDetails}>
              <fieldset disabled={!editable}>
                <Row className='smaller-row'>
                {/* Project Number */}
                <Col xs={12} md={3}>
                  <h6 className={styles.headingLabel}>Number</h6>
            <Form.Control
              name='projectNumber'
              value={projectNumber}
              onChange={(e) => {setProjectNumber(parseInt(e.target.value))}}
          />
      </Col>

                {/* Project Title */}
                <Col xs={12} md={4}>
                  <h6 className={styles.headingLabel}>Title</h6>
              <Form.Control
                name='projectTitle'
                value={projectTitle}
                onChange={(e) => {setProjectTitle(e.target.value)}}
            />
      </Col>

              {/* Total Budget */}
                <Col xs={12} md={3}>
                  <h6 className={styles.headingLabel}>Total Budget</h6>
              <Form.Control
                name='totalBudget'
                value={Number(totalBudget)}
                onChange={(e) => {setTotalBudget(new Prisma.Decimal(e.target.value))}}
            />
      </Col>

              {/* Remaining Budget */}
                <Col xs={12} md={2}>
                  <h6 className={styles.headingLabel}>Remaining Budget</h6>
              <Form.Control
                name='remainingBudget'
                value={Number(remainingBudget)}
                onChange={(e) => {setRemainingBudget(new Prisma.Decimal(e.target.value))}}
                readOnly={true}
            />
      </Col>
      </Row>
              </fieldset>
            </Form>

 <Row className='mt-3'>
              {/* Mentors */}
              <Form className={styles.requestDetails}>
              <fieldset disabled={!editable}>
              <Row>
                <Col xs={12} md={1}>
                <h6 className={styles.headingLabel}>Mentors</h6>
                </Col>
              {
                mentors.map((mentor, mentorIndex) => {
                  return (
                    <Col xs={12} md={2} key={mentorIndex}>
                    <Form.Control
                      name='mentor'
                      value={mentor}
                      onChange={(e) => {handleMentorChange(e.target.value, mentorIndex)}}
                    />
                    </Col>
                  )
                })
              }
              </Row>
              </fieldset>
              </Form>
      </Row>

              <div className='mb-3'></div>

              {/* Students */}
              <Form className={styles.requestDetails}>
                <fieldset disabled={!editable}>
              <Row>
              <Col xs={12} md={12}>
                <h6 className={styles.headingLabel}>Students</h6>
              </Col>
              {
                students.map((student, studentIndex) => {
                  return (
                    <Col xs={12} md={2} key={studentIndex}>
                    <Form.Control
                      name='student'
                      value={student}
                      onChange={(e) => {handleStudentChange(e.target.value, studentIndex)}}
                    />
                    </Col>
                  )
                })
              }
              </Row>
                </fieldset>
              </Form>
              
            <Row className='mt-3'>
              {/*EDIT BUTTON */}
              <Col xs={12} className='d-flex justify-content-end'>
                    {!editable && (
                      <Button
                        className={`${styles.editBtn} ${styles.cardBtn}`}
                        variant='warning'
                        onClick={(e) => setEditable(true)}
                      >
                        Edit
                      </Button>
                    )}
               </Col>
            </Row>

             <Row>
               {/*SAVE BUTTON */}
               <Col xs={12} className='d-flex justify-content-end'>
                    {editable && (
                      <Button
                        className={styles.cardBtn}
                        variant='success'
                        onClick={(e) => handleSave()}
                        >
                        Save
                        </Button>
                      )}
                </Col>
              </Row>

            {/* COLLAPSED ROW */}
            <Collapse in={collapse}>
              <div>
                {
                  // TODO:: make status editable
                  // TODO:: change processed order status from approved to ordered
                  // for change status could change process/update API to also accept params as string like "approved" and then update status object
                  // TODO:: show admin and mentor comments for request using process of request and make admin comments editable
                  // TODO:: make request additional info editable using request/update API 
                  // TODO:: change option to update vendorID to vendorName similar to orders/admin
                }                
                {
                  items.map((reqItems, reqIndex) => {
                    // only shows processed requests for order history - i.e. were approved and ordered, or were rejected
                    if ((requests[projectIndex][reqIndex].Process[0].status === Status.APPROVED && processed(requests[projectIndex][reqIndex].requestID) === true) || 
                    requests[projectIndex][reqIndex].Process[0].status === Status.REJECTED) 
                  {
                    return (
                      <div key={reqIndex}>
                      <Row className='smaller-row'>
                        <div className='mb-3'></div>
                      {/* Request ID */}
                      <Col xs={12} md={7}>
                        {/* first find the request list for the project passed in, then find the specific reques index and access its request data like ID */}
                        <h6 className={styles.headingLabel}>Request #{requests[projectIndex][reqIndex].requestID}</h6>
                        </Col>
                      {/* Request status */}
                       <Col xs={12} md={3}>
                        <h6 className={styles.headingLabel}>Status </h6>
                        <p>
                        {requests[projectIndex][reqIndex].Process[0].status}
                        </p>
                      </Col>
                      {/* Order Cost for Request */}
                      <Col xs={12} md={2}>
                        <h6 className={styles.headingLabel}> Order Subtotal</h6>
                        <p>
                        ${calculateTotalCost(reqIndex).toFixed(2)}
                        </p>
                        </Col>
                      </Row>
      
                      {/* REQUEST ITEMS */}
                      <Row className='my-2'>
                      <Form className={styles.requestDetails}>
                        {
                        <fieldset disabled={!editable}>
                          <Table responsive striped>
                            <thead>
                              <tr>
                                <th>#</th>
                                <th>Description</th>
                                <th>Vendor</th>
                                <th>URL</th>
                                <th>Part #</th>
                                <th>Qty</th>
                                <th>Unit Price</th>
                                <th>Total</th>
                                <th>Order #</th>
                                <th>Tracking Info</th>
                              </tr>
                            </thead>
                            <tbody>
                              {reqItems.map((item, itemIndex) => {
                                return (
                                  <tr key={itemIndex}>
                                    <td>{itemIndex + 1}</td>
                                    <td>
                                      <Form.Control
                                        name='description'
                                        value={item.description}
                                        onChange={(e) =>
                                          handleItemChange(
                                            e as React.ChangeEvent<HTMLInputElement>,
                                            itemIndex, 
                                            reqIndex, 
                                            requests[projectIndex][reqIndex] // to access the specific request object with request and other data, for the item
                                          )
                                        }
                                      />
                                    </td>
                                    <td>
                                      <Form.Control
                                        name='vendorID'
                                        value={item.vendorID} // TODO:: change vendorID to vendorName, similar to AdminRequestCard.tsx
                                        onChange={(e) =>
                                          handleItemChange(
                                            e as React.ChangeEvent<HTMLInputElement>,
                                            itemIndex, 
                                            reqIndex, 
                                            requests[projectIndex][reqIndex]
                                          )
                                        }
                                      />
                                    </td>
                                    <td>
                                      <Form.Control
                                        name='url'
                                        value={item.url} // TODO:: make item url shown as clickable link
                                        onChange={(e) =>
                                          handleItemChange(
                                            e as React.ChangeEvent<HTMLInputElement>,
                                            itemIndex, 
                                            reqIndex, 
                                            requests[projectIndex][reqIndex]
                                          )
                                        }
                                      />
                                    </td>
                                    <td>
                                      <Form.Control
                                        name='partNumber'
                                        value={item.partNumber}
                                        onChange={(e) =>
                                          handleItemChange(
                                            e as React.ChangeEvent<HTMLInputElement>,
                                            itemIndex, 
                                            reqIndex, 
                                            requests[projectIndex][reqIndex]
                                          )
                                        }
                                      />
                                    </td>
                                    <td>
                                      <Form.Control
                                        name='quantity'
                                        value={item.quantity}
                                        onChange={(e) =>
                                          handleItemChange(
                                            e as React.ChangeEvent<HTMLInputElement>,
                                            itemIndex, 
                                            reqIndex, 
                                            requests[projectIndex][reqIndex]
                                          )
                                        }
                                      />
                                    </td>
                                    <td>
                                      <Form.Control
                                        name='unitPrice'
                                        value={item.unitPrice.toString()}
                                        onChange={(e) =>
                                          handleItemChange(
                                            e as React.ChangeEvent<HTMLInputElement>,
                                            itemIndex, 
                                            reqIndex, 
                                            requests[projectIndex][reqIndex]
                                          )
                                        }
                                      />
                                    </td>
                                    <td>
                                      <InputGroup>
                                        <InputGroup.Text>$</InputGroup.Text>
                                        <Form.Control
                                          value={(
                                            item.quantity * (item.unitPrice as any)
                                          ).toFixed(2)}
                                          disabled
                                        />
                                      </InputGroup>
                                    </td>
                                    <td>
                                      <Form.Control />
                                    </td>
                                    <td>
                                      <Form.Control />
                                    </td>
                                  </tr>
                                )
                              })}
                            </tbody>
                          </Table>
                        </fieldset>
                        }
                      </Form>
                    </Row>
                    </div>
                          )
                  }
                  })
                }
              </div>
            </Collapse>
          </Card.Body>
        </Card>
      </Col>
    </Row>
  )
}

export default AdminProjectCard
