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
import { Prisma, User, Project } from '@prisma/client'
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
  // state for editing the request details
  const [editable, setEditable] = useState<boolean>(false)

  const [projectNumber, setProjectNumber] = useState(project.projectNum);
  const [projectTitle, setProjectTitle] = useState(project.projectTitle);
  const [totalBudget, setTotalBudget] = useState(project.startingBudget);
  const [remainingBudget, setRemainingBudget] = useState(Prisma.Decimal.sub(project.startingBudget, project.totalExpenses)); // subtracts values of decimal data type
  const [mentors1, setMentors1] = useState("Teacher 1");
  const [mentors2, setMentors2] = useState("Teacher 2");
  const [students1, setStudents1] = useState("Student 1");
  const [students2, setStudents2] = useState("Student 2");
  const [students3, setStudents3] = useState("Student 3");
  const [students4, setStudents4] = useState("Student 4");
  const [students5, setStudents5] = useState("Student 5");
  const [students6, setStudents6] = useState("Student 6");
  // state that contains the values of the input fields in the request card
  const [inputValues, setInputValues] = useState(
    // for each request in a project, store the request items for those requests
    requests[projectIndex].map((request) => {
      return request.RequestItem.map((item) => {
      return { ...item }
      })
    })
  )

  // Show cards by default and rerenders everytime collapsed changes
  useEffect(() => {
    setCollapse(collapsed)
  }, [collapsed])

  

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
                onChange={(e) => {setMentors1(e.target.value)}}
              />
              </Col>
              <Col xs={12} md={2}>
              <Form.Control
                name='mentors2'
                value={mentors2}
                onChange={(e) => {setMentors2(e.target.value)}}
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
                onChange={(e) => {setStudents1(e.target.value)}}
              />
              </Col>
              <Col xs={12} md={2}>
              <Form.Control
                name='students2'
                value={students2}
                onChange={(e) => {setStudents2(e.target.value)}}
              />
              </Col>
              <Col xs={12} md={2}>
              <Form.Control
                name='students3'
                value={students3}
                onChange={(e) => {setStudents3(e.target.value)}}
              />
              </Col>
              <Col xs={12} md={2}>
              <Form.Control
                name='students4'
                value={students4}
                onChange={(e) => {setStudents4(e.target.value)}}
              />
              </Col>
              <Col xs={12} md={2}>
              <Form.Control
                name='students5'
                value={students5}
                onChange={(e) => {setStudents5(e.target.value)}}
              />
              </Col>
              <Col xs={12} md={2}>
              <Form.Control
                name='students6'
                value={students6}
                onChange={(e) => {setStudents6(e.target.value)}}
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
                  <h6 className={styles.headingLabel}>Request # {requests[projectIndex][reqIndex].requestID}</h6>
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
