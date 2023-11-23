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
import { User } from '@prisma/client'
import axios from 'axios'

interface AdminRequestCardProps {
  details: RequestDetails
  onReject: () => void
  collapsed: boolean
}

const AdminRequestCard: React.FC<AdminRequestCardProps> = ({
  details,
  onReject,
  collapsed,
}) => {
  // state for the student that requested the order
  const [studentThatRequested, setStudentThatRequested] = useState<User>()
  // state for the mentor that approved the order
  const [mentorThatApproved, setMentorThatApproved] = useState<User>()
  // state for the collapse for request details
  const [collapse, setCollapse] = useState<boolean | undefined>(false)
  // state for editing the request details
  const [editable, setEditable] = useState<boolean>(false)
  // state that contains the values of the input fields in the request card
  const [inputValues, setInputValues] = useState(
    // initialized by the details prop
    details.RequestItem.map((item) => {
      return { ...item }
    })
  )

  // Show cards by default and rerenders everytime collapsed changes
  useEffect(() => {
    setCollapse(collapsed)
  }, [collapsed])

  // Get the student and mentor that requested and approved the order - only runs once
  useEffect(() => {
    getStudentThatRequested()
    getMentorThatApproved()
  }, [])

  /**
   * This function provides the data received from our API of the student that requested the order
   * @returns User object of the student that requested the order
   */
  async function getStudentThatRequested() {
    try {
      if (!details.Process[0].mentorID) return null
      const user = await axios.get(`/api/user/${details.studentID}`)
      if (user.status === 200) setStudentThatRequested(user.data)
      return user
    } catch (error) {
      if (axios.isAxiosError(error)) console.log(error.status, error.message)
      else if (error instanceof Error) console.log(error.message)
      else console.log(error)
    }
  }

  /**
   * This function provides the data received from our API of the mentor that approved the order
   * @returns User object of the mentor that approved the order
   */
  async function getMentorThatApproved() {
    try {
      if (!details.Process[0].mentorID) return null
      const user = await axios.get(`/api/user/${details.Process[0].mentorID}`)
      if (user.status === 200) setMentorThatApproved(user.data)
      return user
    } catch (error) {
      if (axios.isAxiosError(error) || error instanceof Error)
        console.log(error.message)
      else console.log(error)
    }
  }

  /**
   * This function handles changes to inputs whenever user is editing the input fields in the request card
   * @param e - the onChange event passed by the input field
   * @param index - the index of the request item the input field is in within the request items array
   */
  function handleInputChange(
    e: React.ChangeEvent<HTMLInputElement>,
    index: number
  ) {
    const { name, value } = e.target

    setInputValues((prev) => {
      return prev.map((item, i) => {
        if (i !== index) return item
        return {
          ...item,
          [name]: value,
        }
      })
    })
  }

  /**
   * This function handles saving the changes made to the request card
   */
  async function handleSave() {
    setEditable(false)
    try {
      const newDetails = {
        ...details, // copy the details object
        RequestItem: inputValues, // replace the RequestItem array with the new inputs in each request item
      }

      for (let i = 0; i < newDetails.RequestItem.length; i++) {
        const response = await axios.post('/api/request-form/update', {
          requestID: details.requestID,
          itemID: details.RequestItem[i].itemID,
          description: newDetails.RequestItem[i].description, // used new details data in parameters for editable fields
          url: newDetails.RequestItem[i].url, 
          partNumber: newDetails.RequestItem[i].partNumber, 
          quantity: newDetails.RequestItem[i].quantity, 
          unitPrice: newDetails.RequestItem[i].unitPrice, 
        })
        if (response.status === 200) console.log(response.data)
      }
    } catch (error) {
      if (axios.isAxiosError(error) || error instanceof Error)
        console.error(error.message)
      else console.log(error)
    }
  }

  return (
    <Row className='mb-4'>
      <Col>
        <Card style={{ backgroundColor: '#f8f9fa' }}>
          <Card.Body>
            {/* UNCOLLAPSED ROW */}
            <Row className='smaller-row'>
              {/* REQUEST NUMBER */}
              <Col xs={12} lg={3}>
                <Card.Title>
                  <h4 className={styles.headingLabel}>
                    Request #{details.requestID}
                  </h4>
                </Card.Title>
              </Col>

              {/* DATE REQUESTED */}
              <Col xs={6} lg={2}>
                <h6 className={styles.headingLabel}>Date Requested</h6>
                <p>
                  {new Date(details.dateSubmitted).toLocaleDateString(
                    undefined,
                    {
                      weekday: 'short',
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    }
                  )}
                </p>
              </Col>

              {/* DATE NEEDED */}
              <Col xs={6} lg={2}>
                <h6 className={styles.headingLabel}>Date Needed</h6>
                <p>
                  {new Date(details.dateNeeded).toLocaleDateString(undefined, {
                    weekday: 'short',
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })}
                </p>
              </Col>

              {/* ORDER SUBTOTAL */}
              <Col xs={6} lg={2}>
                <h6 className={styles.headingLabel}>Order Subtotal</h6>
                <p>
                  $
                  {details.RequestItem.reduce(
                    (total, item) =>
                      total + item.quantity * (item.unitPrice as any),
                    0
                  ).toFixed(4)}
                </p>
              </Col>

              {/* STATUS */}
              <Col xs={6} lg={3}>
                <h6 className={styles.headingLabel}>Status</h6>
                <p>{details.Process[0].status}</p>
              </Col>
            </Row>

            {/* COLLAPSED ROW */}
            <Collapse in={collapse}>
              <div>
                <Row className='my-4 smaller-row'>
                  {/* JUSTIFICATION ADDITIONAL INFO */}
                  <Col xs={12} lg={3}>
                    <h6 className={styles.headingLabel}>Additional info:</h6>
                    <p>
                      {!details.additionalInfo
                        ? 'none'
                        : details.additionalInfo}
                    </p>
                    <h6 className={styles.headingLabel}>Sponsor:</h6>
                    <p>{details.project.sponsorCompany}</p>
                  </Col>

                  {/* REQUESTED BY/APPROVED BY */}
                  <Col xs={12} lg={4}>
                    <h6 className={styles.headingLabel}>Requested by:</h6>
                    <p>{studentThatRequested?.email}</p>

                    <h6 className={styles.headingLabel}>Approved by:</h6>
                    <p>{mentorThatApproved?.email}</p>
                  </Col>

                  {/* REJECT/EDIT BUTTONS */}
                  <Col xs={12} lg={5}>
                    <Button
                      className={`${styles.cardBtn} ${styles.rejectBtn}`}
                      variant='danger'
                      style={{ minWidth: '150px', marginRight: '20px' }}
                      onClick={onReject}
                    >
                      Reject
                    </Button>{' '}
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

                {/* REQUEST ITEMS */}
                <Row className='my-2'>
                  <Form className={styles.requestDetails}>
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
                          {inputValues.map((item, itemIndex) => {
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
                                        itemIndex
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
                                        itemIndex
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
                                        itemIndex
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
                                        itemIndex
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
                                        itemIndex
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
                    <Row>
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
                  </Form>
                </Row>
              </div>
            </Collapse>
          </Card.Body>
        </Card>
      </Col>
    </Row>
  )
}

export default AdminRequestCard
