// RequestCard.tsx
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

  useEffect(() => {
    setCollapse(collapsed)
  }, [collapsed])

  useEffect(() => {
    getStudentThatRequested()
    getMentorThatApproved()
  }, [])

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
                      variant='danger'
                      style={{ minWidth: '150px', marginRight: '20px' }}
                      onClick={onReject}
                    >
                      Reject
                    </Button>{' '}
                    <Button
                      variant='warning'
                      style={{ minWidth: '150px', marginRight: '20px' }}
                    >
                      Edit
                    </Button>{' '}
                  </Col>
                </Row>

                <Row className='my-2'>
                  <Form className={styles.requestDetails}>
                    <fieldset disabled>
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
                          {details.RequestItem.map((item, itemIndex) => {
                            return (
                              <tr>
                                <td>{itemIndex + 1}</td>
                                <td>
                                  <Form.Control
                                    value={item.description}
                                  ></Form.Control>
                                </td>
                                <td>{item.vendorID}</td>
                                <td>
                                  <Form.Control value={item.url}></Form.Control>
                                </td>
                                <td>
                                  <Form.Control
                                    value={item.partNumber}
                                  ></Form.Control>
                                </td>
                                <td>
                                  <Form.Control value={item.quantity} />
                                </td>
                                <td>
                                  <Form.Control
                                    value={item.unitPrice.toString()}
                                  />
                                </td>
                                <td>
                                  <InputGroup>
                                    <InputGroup.Text>$</InputGroup.Text>
                                    <Form.Control
                                      value={(
                                        item.quantity * (item.unitPrice as any)
                                      ).toFixed(4)}
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
