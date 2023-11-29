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
import { Prisma, User, Project, WorksOn } from '@prisma/client'
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
  }, [])

  // show cards by default, and rerenders everytime collapse state's value changes
  useEffect(() => {
    setCollapse(collapsed)
  }, [collapsed])

  const [projectNumber, setProjectNumber] = useState(project.projectNum);
  const [projectTitle, setProjectTitle] = useState(project.projectTitle);
  const [totalBudget, setTotalBudget] = useState(project.startingBudget);
  const [remainingBudget, setRemainingBudget] = useState(Prisma.Decimal.sub(project.startingBudget, project.totalExpenses)); // subtract values of decimal data type
  const [mentors1, setMentors1] = useState(" ");
  const [mentors2, setMentors2] = useState(" ");
  const [students1, setStudents1] = useState(" ");
  const [students2, setStudents2] = useState(" ");
  const [students3, setStudents3] = useState(" ");
  const [students4, setStudents4] = useState(" ");
  const [students5, setStudents5] = useState(" ");
  const [students6, setStudents6] = useState(" ");
  const [users, setUsers] = useState<boolean[]>([false, false, false, false, false, false, false, false]) // track which of the 8 mentors & students were edited by admin

  // state that contains the values of the input fields in the request card
  const [inputValues, setInputValues] = useState(
    // for each request in a project, store the request items for those requests
    requests[projectIndex].map((request) => {
      return request.RequestItem.map((item) => {
      return { ...item }
      })
    })
  )

  // sets default values based on existing works on user info and rerenders if works on users change
  useEffect(() => {
    setMentors1((mentorArr.length >= 1) ? ("" + mentorArr[0].firstName + " " + mentorArr[0].lastName) : (""))
    setMentors2((mentorArr.length >= 2) ? (mentorArr[1].firstName + " " + mentorArr[1].lastName) : (""))
  }, [mentorArr]) 

  useEffect(() => {
    setStudents1(studentArr.length >= 1 ? (studentArr[0].firstName + " " + studentArr[0].lastName) : (""))
    setStudents2(studentArr.length >= 2 ? (studentArr[1].firstName + " " + studentArr[1].lastName) : (""))
    setStudents3(studentArr.length >= 3 ? (studentArr[2].firstName + " " + studentArr[2].lastName) : (""))
    setStudents4(studentArr.length >= 4 ? (studentArr[3].firstName + " " + studentArr[3].lastName) : (""))
    setStudents5(studentArr.length >= 5 ? (studentArr[4].firstName + " " + studentArr[4].lastName) : (""))
    setStudents6(studentArr.length >= 6 ? (studentArr[5].firstName + " " + studentArr[5].lastName) : (""))
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

  const updateUserAtIndex = (index: number, value: boolean) => {
    const updatedUsers = [...users];
    updatedUsers[index] = value; // Update the value at the specified index
    setUsers(updatedUsers); // Set the state with the new array
  };

  function handleUserChange(targetName: string, targetValue: string) {
    switch(targetName) {
      case 'mentors1':
        setMentors1(targetValue)
        updateUserAtIndex(0, true)
        break
      case 'mentors2':
        setMentors2(targetValue)
        updateUserAtIndex(1, true)
        break
      case 'students1':
        setStudents1(targetValue)
        updateUserAtIndex(2, true)
        break
      case 'students2':
        setStudents2(targetValue)
        updateUserAtIndex(3, true)
        break
      case 'students3':
        setStudents3(targetValue)
        updateUserAtIndex(4, true)
        break
      case 'students4':
        setStudents4(targetValue)
        updateUserAtIndex(5, true)
        break
      case 'students5':
        setStudents5(targetValue)
        updateUserAtIndex(6, true)
        break
      case 'students6':
        setStudents6(targetValue)
        updateUserAtIndex(7, true)
        break
    }
  }
  /**
   * This function handles changes to inputs whenever user is editing the input fields in the request card
   * @param e - the onChange event passed by the input field
   * @param index - the index of the request item the input field is in within the request items array
   */

  function handleInputChange(
    e: React.ChangeEvent<HTMLInputElement>,
    itemIndex: number,
    requestIndex: number
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
  }

  /**
   * This function handles saving the changes made to the request card
   */
  async function handleSave() {
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
      for (let i = 0; i < users.length; i++) {
        console.log("update status of user " + (i + 1) + " : " + users[i])
      }
      
      if (users[0] === true) { // if mentor was edited
        if (mentorArr.length >= 1) { // if existing mentor array had an initial value for mentor but now admin removed initial mentor
          worksOnRes = await axios.get('/api/worksOn/currentProjects/', {
            params: {
              userID: mentorArr[0].userID,
          }})
          if (worksOnRes.status === 200) { // first get worksOn entry to access start date, then deactivate initial user
            console.log("found current projects of mentor 1")
            console.log(worksOnRes.data)
          }
          worksOns = worksOnRes.data.worksOn
          projectWorksOn = worksOns.filter((worksOn) => (worksOn.projectID === project.projectID))

          deactivateRes = await axios.post('/api/worksOn/deactivate/', {
          netID: mentorArr[0].netID,
          projectNum: newProject.projectNum,
          startDate: projectWorksOn[0].startDate,
          })
          if (deactivateRes.status === 200) {
            console.log("deactivated mentor 1")
            console.log(deactivateRes.data)
          } 
        }
        if (mentors1.length > 1) { // if admin added new mentor
          userRes = await axios.post('/api/user/get/fullName', {
            firstName: mentors1.substring(0, mentors1.search(" ")), // extract 2 values since first name and last name are separated by a space
            lastName: mentors1.substring(mentors1.search(" ") + 1)
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
      if (users[1] === true) { // if mentor was edited
        if (mentorArr.length >= 2) { // if existing mentor array had an initial value for mentor but now admin removed initial mentor
          worksOnRes = await axios.get('/api/worksOn/currentProjects/', {
            params: {
              userID: mentorArr[1].userID,
          }})
          if (worksOnRes.status === 200) { // first get worksOn entry to access start date, then deactivate initial user
            console.log("found current projects of mentor 2")
            console.log(worksOnRes.data)
          } 
          worksOns = worksOnRes.data.worksOn
          projectWorksOn = worksOns.filter((worksOn) => (worksOn.projectID === project.projectID))

          deactivateRes = await axios.post('/api/worksOn/deactivate/', {
            netID: mentorArr[1].netID,
            projectNum: newProject.projectNum,
            startDate: projectWorksOn[0].startDate,
          })
          if (deactivateRes.status === 200) {
            console.log("deactivated mentor 2")
            console.log(deactivateRes.data)
          } 
        }
        if (mentors2.length > 1) { // if admin added new mentor
          userRes = await axios.post('/api/user/get/fullName', {
            firstName: mentors2.substring(0, mentors2.search(" ")), // extract 2 values since first name and last name are separated by a space
            lastName: mentors2.substring(mentors2.search(" ") + 1)
          })
          if (userRes.status === 200) { // first validate the entered user then add to project
            console.log("found new user entered as mentor 2")
            console.log(userRes.data)
          }
          worksOnRes = await axios.post('/api/worksOn/', {
            netID: userRes.data.user.netID,
            projectNum: newProject.projectNum,
          })
          if (worksOnRes.status === 201) {
            console.log("added new user as mentor 2")
            console.log(worksOnRes.data)
          }
        }
      }

      for (let i = 2; i < users.length; i++) { // loop through remaining students that could be edited
        if (users[i] === true) { // if user was edited
          // if existing array had an initial value for but now admin removed initial user
          if (studentArr.length >= (i + 1 - 2)) { // i + 1 since i is array index so 1 less than length, and - 2 since user[2] corresponds to studentArr[0], etc
            worksOnRes = await axios.get('/api/worksOn/currentProjects/', {
              params: {
                userID: studentArr[i - 2].userID,
            }})
            if (worksOnRes.status === 200) { // first get worksOn entry to access start date, then deactivate initial user
              console.log("found current projects of student " + (i + 1 - 2))
              console.log(worksOnRes.data)
            } 
            worksOns = worksOnRes.data.worksOn
            projectWorksOn = worksOns.filter((worksOn) => (worksOn.projectID === project.projectID))
  
            deactivateRes = await axios.post('/api/worksOn/deactivate/', {
              netID: studentArr[i - 2].netID, // - 2 since user[2] corresponds to studentArr[0], etc
              projectNum: newProject.projectNum,
              startDate: projectWorksOn[0].startDate,
            })
            if (deactivateRes.status === 200) {
              console.log("deactivated student " + (i + 1 - 2))
              console.log(deactivateRes.data)
            } 
          }
          
          switch(i) {
            case 2:
              if (students1.length > 1) { // if admin added new mentor
                userRes = await axios.post('/api/user/get/fullName', {
                  firstName: students1.substring(0, students1.search(" ")), // extract 2 values since first name and last name are separated by a space
                  lastName: students1.substring(students1.search(" ") + 1)
                })
                if (userRes.status === 200) { // first validate the entered user then add to project
                  console.log("found new user entered as student " + (i + 1 - 2))
                  console.log(userRes.data)
                }
                worksOnRes = await axios.post('/api/worksOn/', {
                  netID: userRes.data.user.netID,
                  projectNum: newProject.projectNum,
                })
                if (worksOnRes.status === 201) {
                  console.log("added new user entered as student " + (i + 1 - 2))
                  console.log(worksOnRes.data)
                }
              }
              break
            case 3:
              if (students2.length > 1) { // if admin added new mentor
                userRes = await axios.post('/api/user/get/fullName', {
                  firstName: students2.substring(0, students2.search(" ")), // extract 2 values since first name and last name are separated by a space
                  lastName: students2.substring(students2.search(" ") + 1)
                })
                if (userRes.status === 200) { // first validate the entered user then add to project
                  console.log("found new user entered as student " + (i + 1 - 2))
                  console.log(userRes.data)
                }
                worksOnRes = await axios.post('/api/worksOn/', {
                  netID: userRes.data.user.netID,
                  projectNum: newProject.projectNum,
                })
                if (worksOnRes.status === 201) {
                  console.log("added new user entered as student " + (i + 1 - 2))
                  console.log(worksOnRes.data)
                }
              }
              break
            case 4:
              if (students3.length > 1) { // if admin added new mentor
                userRes = await axios.post('/api/user/get/fullName', {
                  firstName: students3.substring(0, students3.search(" ")), // extract 2 values since first name and last name are separated by a space
                  lastName: students3.substring(students3.search(" ") + 1)
                })
                if (userRes.status === 200) { // first validate the entered user then add to project
                  console.log("found new user entered as student " + (i + 1 - 2))
                  console.log(userRes.data)
                }
                worksOnRes = await axios.post('/api/worksOn/', {
                  netID: userRes.data.user.netID,
                  projectNum: newProject.projectNum,
                })
                if (worksOnRes.status === 201) {
                  console.log("added new user entered as student " + (i + 1 - 2))
                  console.log(worksOnRes.data)
                }
              }
              break
            case 5:
              if (students4.length > 1) { // if admin added new mentor
                userRes = await axios.post('/api/user/get/fullName', {
                  firstName: students4.substring(0, students4.search(" ")), // extract 2 values since first name and last name are separated by a space
                  lastName: students4.substring(students4.search(" ") + 1)
                })
                if (userRes.status === 200) { // first validate the entered user then add to project
                  console.log("found new user entered as student " + (i + 1 - 2))
                  console.log(userRes.data)
                }
                worksOnRes = await axios.post('/api/worksOn/', {
                  netID: userRes.data.user.netID,
                  projectNum: newProject.projectNum,
                })
                if (worksOnRes.status === 201) {
                  console.log("added new user entered as student " + (i + 1 - 2))
                  console.log(worksOnRes.data)
                }
              }
              break
            case 6:
              if (students5.length > 1) { // if admin added new mentor
                userRes = await axios.post('/api/user/get/fullName', {
                  firstName: students5.substring(0, students5.search(" ")), // extract 2 values since first name and last name are separated by a space
                  lastName: students5.substring(students5.search(" ") + 1)
                })
                if (userRes.status === 200) { // first validate the entered user then add to project
                  console.log("found new user entered as student " + (i + 1 - 2))
                  console.log(userRes.data)
                }
                worksOnRes = await axios.post('/api/worksOn/', {
                  netID: userRes.data.user.netID,
                  projectNum: newProject.projectNum,
                })
                if (worksOnRes.status === 201) {
                  console.log("added new user entered as student " + (i + 1 - 2))
                  console.log(worksOnRes.data)
                }
              }
              break
            case 7:
              if (students6.length > 1) { // if admin added new mentor
                userRes = await axios.post('/api/user/get/fullName', {
                  firstName: students6.substring(0, students6.search(" ")), // extract 2 values since first name and last name are separated by a space
                  lastName: students6.substring(students6.search(" ") + 1)
                })
                if (userRes.status === 200) { // first validate the entered user then add to project
                  console.log("found new user entered as student " + (i + 1 - 2))
                  console.log(userRes.data)
                }
                worksOnRes = await axios.post('/api/worksOn/', {
                  netID: userRes.data.user.netID,
                  projectNum: newProject.projectNum,
                })
                if (worksOnRes.status === 201) {
                  console.log("added new user entered as student " + (i + 1 - 2))
                  console.log(worksOnRes.data)
                }
              }
              break
          }
        }
      }
      getProjectMembers() // update current users arrays for students and mentors after adding/removing
      setUsers([false, false, false, false, false, false, false, false]) // reset edit statuses to false since after save, resets to none have been edited yet
    }
    catch (error) {
      console.log(error)
      if (axios.isAxiosError(error) || error instanceof Error)
        console.error(error.message)
      else console.error(error)
    }

    /*
    try {
      const newDetails = {
        ...details, // copy the details object
        RequestItem: inputValues, // replace the RequestItem array with the new input values
      }
      // The API is giving a 500 error when trying to update the request details - sorry it wasn't fixed
      const response = await axios.post('/api/request-form/update', {
        requestID: details.requestID,
        requestDetails: newDetails,
      })

      if (response.status === 200) console.log(response.data)
    } catch (error) {
      if (axios.isAxiosError(error) || error instanceof Error)
        console.error(error.message)
      else console.error(error)
    }
    */
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
              <Col xs={12} md={2}>
              <Form.Control
                name='mentors1'
                value={mentors1}
                onChange={(e) => {handleUserChange(e.target.name, e.target.value)}}
              />
              </Col>
              <Col xs={12} md={2}>
              <Form.Control
                name='mentors2'
                value={mentors2}
                onChange={(e) => {handleUserChange(e.target.name, e.target.value)}}
              />
              </Col>
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
              <Col xs={12} md={2}>
              <Form.Control
                name='students1'
                value={students1}
                onChange={(e) => {handleUserChange(e.target.name, e.target.value)}}
              />
              </Col>
              <Col xs={12} md={2}>
              <Form.Control
                name='students2'
                value={students2}
                onChange={(e) => {handleUserChange(e.target.name, e.target.value)}}
              />
              </Col>
              <Col xs={12} md={2}>
              <Form.Control
                name='students3'
                value={students3}
                onChange={(e) => {handleUserChange(e.target.name, e.target.value)}}
              />
              </Col>
              <Col xs={12} md={2}>
              <Form.Control
                name='students4'
                value={students4}
                onChange={(e) => {handleUserChange(e.target.name, e.target.value)}}
              />
              </Col>
              <Col xs={12} md={2}>
              <Form.Control
                name='students5'
                value={students5}
                onChange={(e) => {handleUserChange(e.target.name, e.target.value)}}
              />
              </Col>
              <Col xs={12} md={2}>
              <Form.Control
                name='students6'
                value={students6}
                onChange={(e) => {handleUserChange(e.target.name, e.target.value)}}
              />
              </Col>
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
                  ${requests[projectIndex][reqIndex].RequestItem.reduce(
                    (total, item) =>
                      total + item.quantity * (item.unitPrice as any),
                    0
                  ).toFixed(4)}
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
                                      itemIndex, reqIndex
                                    )
                                  }
                                />
                              </td>
                              <td>{item.vendorID}</td>
                              <td>
                                <Form.Control
                                  name='url'
                                  value={item.url}
                                  onChange={(e) =>
                                    handleInputChange(
                                      e as React.ChangeEvent<HTMLInputElement>,
                                      itemIndex, reqIndex
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
                                      itemIndex, reqIndex
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
                                      itemIndex, reqIndex
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
                                      itemIndex, reqIndex
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
