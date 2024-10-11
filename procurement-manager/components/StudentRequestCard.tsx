/**
 * This component is a card that displays the details of a request made by a student
 */

import { RequestDetails } from '@/lib/types'
import axios from 'axios'
import { User } from 'next-auth'
import React, { useEffect, useState } from 'react'
import {
  Card,
  Button,
  Col,
  Row,
  Collapse,
  Form,
  InputGroup,
  Table,
} from 'react-bootstrap'
import styles from '@/styles/RequestCard.module.scss'
import { Status } from '@prisma/client'

interface RequestCardProps {
  details: RequestDetails
  collapsed: boolean
}

const StudentRequestCard: React.FC<RequestCardProps> = ({
  details,
  collapsed,
}) => {
  // state for the student that requested the order
  const [studentThatRequested, setStudentThatRequested] = useState<User>()
  // state for the mentor that approved the order
  const [mentorThatApproved, setMentorThatApproved] = useState<User>()
  // state for the collapse for request details
  const [collapse, setCollapse] = useState<boolean | undefined>(false)
  // state for editing the request details
  // TODO:: integrate editing with request-form/update API similar to AdminRequestCard and reset status to under review for resubmit
  const [editable, setEditable] = useState<boolean>(false)
  const [resubmit, setResubmit] = useState<boolean>(false)
  // state that contains the values of the input fields in the request card
  const [inputValues, setInputValues] = useState(
    // initialized by the details prop
    details.RequestItem.map((item) => {
      return { ...item }
    })
  )

  useEffect(() => {
    setCollapse(collapsed)
  }, [collapsed])

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

  // TODO :: If the card has a status of REJECTED, then the user can edit the request details and call this function
  function handleSave() {
    setEditable(false)
  }

  // TODO :: After saving??? The student can click on Resubmit and call this function with onSubmit
  function handleResubmit(e: React.ChangeEvent<HTMLInputElement>) {
    setResubmit(false)
  }

  return (
    <Card
      className='request-card mb-3'
      style={{ backgroundColor: 'rgb(240, 240, 240)' }}
    >
      <Row className='mb-4'></Row>
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
              {new Date(details.dateSubmitted).toLocaleDateString(undefined, {
                weekday: 'short',
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              })}
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
              ).toFixed(2)}
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
                  {!details.additionalInfo ? 'none' : details.additionalInfo}
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

              {details.Process[0].status === Status.REJECTED && (
                <Col xs={12} lg={5}>
                  {!editable && (
                    <Button
                      className={`${styles.cardBtn} ${styles.editBtn} mb-3`}
                      variant='warning'
                      onClick={() => setEditable(true)}
                    >
                      Edit
                    </Button>
                  )}
                  <h6 className={styles.headingLabel}>Comments: </h6>
                  <p>
                    {!details.Process[0].adminProcessedComments
                      ? 'No Comments from Admin'
                      : 'Admin: ' + details.Process[0].adminProcessedComments}
                  </p>
                  <p>
                    {!details.Process[0].mentorProcessedComments
                      ? 'No Comments from Mentor'
                      : 'Mentor: ' + details.Process[0].mentorProcessedComments}
                  </p>
                </Col>
              )}
            </Row>

            <Row className='my-2'>
              <Form
                className={styles.requestDetails}
                onSubmit={() => handleResubmit}
              >
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
                {editable && (
                  <Button variant='success' onClick={(e) => handleSave()}>
                    Save
                  </Button>
                )}
                {resubmit && (
                  <Button variant='success' type='submit'>
                    Re-submit
                  </Button>
                )}
              </Form>
            </Row>
          </div>
        </Collapse>
      </Card.Body>
    </Card>
  )
}

export default StudentRequestCard
