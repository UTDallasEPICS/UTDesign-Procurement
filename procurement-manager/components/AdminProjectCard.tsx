/**
 * This component is the card that the Admin will see in the Orders Page
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

  const [projectNumber, setProjectNumber] = useState(project.projectNum);
  const [projectTitle, setProjectTitle] = useState(project.projectTitle);
  const [totalBudget, setTotalBudget] = useState(project.startingBudget);
  const [remainingBudget, setRemainingBudget] = useState(Prisma.Decimal.sub(project.startingBudget, project.totalExpenses)); // subtract values of decimal data type
  const [mentors, setMentors] = useState<string[]>([""])
  const [students, setStudents] = useState<string[]>([""])
  const [updatedMentors, setUpdatedMentors] = useState<boolean[]>([false]) // track which of the mentors were edited by admin
  const [updatedStudents, setUpdatedStudents] = useState<boolean[]>([false])
  const [reqIDs, setReqIDs] = useState<number[]>([]) // track which of the requests were edited by admin using request IDs of updated requests
  const [processedReqs, setProcessedReqs] = useState<RequestDetails[]>([]) // track which of the approved requests have orders, i.e. are completed
  const [requestOrders, setRequestOrders] = useState<Order[][]>([])

  // state that contains the values of the input fields in the request card
  const [inputValues, setInputValues] = useState(
    // for each request in a project, store the request items for those requests
    requests[projectIndex].map((request) => {
      return request.RequestItem.map((item) => {
      return { 
        ...item 
        }
      })
    })
  )

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

  // sets default values based on existing works on user info and rerenders if works on users change
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
        return false
      })
    )
  }, [mentorArr]) 

  useEffect(() => {
    let newStudents = studentArr.map((student) => {
      return (student.firstName + " " + student.lastName)
    })

    // add empty values if less students added to project (like if max students is 3)
    while (newStudents.length < 6) {
      newStudents.push("")
    }
    setStudents(newStudents)
    setUpdatedStudents(
      newStudents.map((student) => {
        return false
      })
    )
  }, [studentArr])

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
              mentors.push(users[i])
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

  function processed (ID: number) 
  {
    for (const req of processedReqs) {
      if (req.requestID === ID) {
        return true
      }
    }
    return false
  }

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
   * @param index - the index of the request item the input field is in within the request items array
   */

  function handleInputChange(
    e: React.ChangeEvent<HTMLInputElement>,
    itemIndex: number,
    requestIndex: number,
    details: RequestDetails
  ) {
    const { name, value } = e.target

    setInputValues((prevRequestItemList) => {
      return prevRequestItemList.map((reqItems, reqItemsIndex) => {
        if (reqItemsIndex !== requestIndex) return reqItems
        return reqItems.map((item, i) => {
          if (i !== itemIndex) return item
          return {
            ...item,
            [name]: value,
          }
        })
      })
    })
    updateReqIDs(details.requestID) // add the request ID to list of updated request IDs
  }

  const updateReqIDs = (value: number) => {
    const storeReqIDs = [...reqIDs]
    storeReqIDs.push(value) // add new value to array
    setReqIDs(storeReqIDs) // Set the state with the updated array
  };

  const calculateTotalCost = (reqIndex: number): Prisma.Decimal => {
    let totalCost = 0
    inputValues[reqIndex].forEach((item) => {
      totalCost += (Number(item.unitPrice) * item.quantity)
    })
    return new Prisma.Decimal(totalCost);
  }

  /**
   * This function handles saving the changes made to the request card
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
      setRemainingBudget(Prisma.Decimal.sub(totalBudget, project.totalExpenses))
      let userRes, worksOnRes, worksOns: WorksOn[], projectWorksOn: WorksOn[], deactivateRes

      console.log("array of update status")
      for (let i = 0; i < mentors.length; i++) {
        console.log("update status of mentor " + (i + 1) + " : " + mentors[i])
      }
      for (let i = 0; i < students.length; i++) {
        console.log("update status of student " + (i + 1) + " : " + students[i])
      }
      
      for (let mentorIndex = 0; mentorIndex < mentors.length; mentorIndex++) 
      {
        if (updatedMentors[mentorIndex] === true)
        {
          if (mentorArr.length >= 1) { // if existing mentor array had an initial value for mentor but now admin removed initial mentor
            worksOnRes = await axios.get('/api/worksOn/currentProjects/', {
              params: {
                userID: mentorArr[mentorIndex].userID,
            }})
            if (worksOnRes.status === 200) { // first get worksOn entry to access start date, then deactivate initial user
              console.log("found current projects of mentor 1")
              console.log(worksOnRes.data)
            }
            worksOns = worksOnRes.data.worksOn
            projectWorksOn = worksOns.filter((worksOn) => (worksOn.projectID === project.projectID))
  
            deactivateRes = await axios.post('/api/worksOn/deactivate/', {
            netID: mentorArr[mentorIndex].netID,
            projectNum: newProject.projectNum,
            startDate: projectWorksOn[0].startDate,
            })
            if (deactivateRes.status === 200) {
              console.log("deactivated mentor 1")
              console.log(deactivateRes.data)
            } 
          }
          if (mentors[mentorIndex].length > 1) { // if admin added new mentor
            userRes = await axios.post('/api/user/get/fullName', {
              firstName: mentors[mentorIndex].substring(0, mentors[mentorIndex].search(" ")), // extract 2 values since first name and last name are separated by a space
              lastName: mentors[mentorIndex].substring(mentors[mentorIndex].search(" ") + 1)
            })
            if (userRes.status === 200) { // first validate the entered user then add to project
              console.log("found new user entered as mentor 1")
              console.log(userRes.data)
            }
            worksOnRes = await axios.post('/api/worksOn/', {
              netID: userRes.data.user.netID,
              projectNum: newProject.projectNum,
            })
            if (worksOnRes.status === 201) {
              console.log("added new user as mentor 1")
              console.log(worksOnRes.data)
            }
          }
        }
      }

      for (let studentIndex = 0; studentIndex < students.length; studentIndex++) 
      {
        if (updatedStudents[studentIndex] === true)
        {
          if (studentArr.length >= 1) { // if existing mentor array had an initial value for mentor but now admin removed initial mentor
            worksOnRes = await axios.get('/api/worksOn/currentProjects/', {
              params: {
                userID: studentArr[studentIndex].userID,
            }})
            if (worksOnRes.status === 200) { // first get worksOn entry to access start date, then deactivate initial user
              console.log("found current projects of mentor 1")
              console.log(worksOnRes.data)
            }
            worksOns = worksOnRes.data.worksOn
            projectWorksOn = worksOns.filter((worksOn) => (worksOn.projectID === project.projectID))
  
            deactivateRes = await axios.post('/api/worksOn/deactivate/', {
            netID: studentArr[studentIndex].netID,
            projectNum: newProject.projectNum,
            startDate: projectWorksOn[0].startDate,
            })
            if (deactivateRes.status === 200) {
              console.log("deactivated mentor 1")
              console.log(deactivateRes.data)
            } 
          }
          if (students[studentIndex].length > 1) { // if admin added new mentor
            userRes = await axios.post('/api/user/get/fullName', {
              firstName: students[studentIndex].substring(0, students[studentIndex].search(" ")), // extract 2 values since first name and last name are separated by a space
              lastName: students[studentIndex].substring(students[studentIndex].search(" ") + 1)
            })
            if (userRes.status === 200) { // first validate the entered user then add to project
              console.log("found new user entered as mentor 1")
              console.log(userRes.data)
            }
            worksOnRes = await axios.post('/api/worksOn/', {
              netID: userRes.data.user.netID,
              projectNum: newProject.projectNum,
            })
            if (worksOnRes.status === 201) {
              console.log("added new user as mentor 1")
              console.log(worksOnRes.data)
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
          RequestItem: inputValues[reqIndex], // replace the RequestItem array with the new inputs in each request item
        }
        let isUpdatedReq: boolean = false
        for (const id of reqIDs) {
          if (details.requestID === id) {
            isUpdatedReq = true
            console.log("updated request: " + details.requestID)
          }
        }
        if (isUpdatedReq) {
          for (let i = 0; i < newDetails.RequestItem.length; i++) {
            updateRequest(reqIndex, details, newDetails, i)
          }
        }
      } catch (error) {
        if (axios.isAxiosError(error) || error instanceof Error)
          console.error(error.message)
        else console.log(error)
      }
    })
    setRemainingBudget(Prisma.Decimal.sub(project.startingBudget, project.totalExpenses))
    setReqIDs([]) // reset list of updated request IDs to empty since after save, resets to none have been edited yet
  }

  async function updateRequest(reqIndex: number, details: RequestDetails, newDetails: RequestDetails, i: number) {
    const res = await axios.post('/api/request-form/update', {
      projectID: project.projectID,
      requestID: details.requestID,
      itemID: details.RequestItem[i].itemID,
      description: newDetails.RequestItem[i].description, // used new details data in parameters for editable fields
      url: newDetails.RequestItem[i].url, 
      partNumber: newDetails.RequestItem[i].partNumber, 
      quantity: newDetails.RequestItem[i].quantity, 
      unitPrice: newDetails.RequestItem[i].unitPrice, 
      // totalExpenses: calculateTotalCost(reqIndex) // not updating total expenses now since need to add update order (shipping cost)
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
                  inputValues.map((reqItems, reqIndex) => {
                    if ((requests[projectIndex][reqIndex].Process[0].status === Status.APPROVED && processed(requests[projectIndex][reqIndex].requestID) === true) || 
                    requests[projectIndex][reqIndex].Process[0].status === Status.REJECTED) // only shows requests that are either approved and ordered, or rejected)
                  {
                    return (
                      <div key={reqIndex}>
                      <Row className='smaller-row'>
                        <div className='mb-3'></div>
                      {/* Request ID */}
                      <Col xs={12} md={7}>
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
                        ${calculateTotalCost(reqIndex).toFixed(4)}
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
                                          handleInputChange(
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
                                        name='vendorID'
                                        value={item.vendorID}
                                        onChange={(e) =>
                                          handleInputChange(
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
                                        value={item.url}
                                        onChange={(e) =>
                                          handleInputChange(
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
                                          handleInputChange(
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
                                          handleInputChange(
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
                                          handleInputChange(
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
                                          ).toFixed(4)}
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
