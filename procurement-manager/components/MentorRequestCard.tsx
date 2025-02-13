/**
 * This component is a card that displays the details of a request that a student has submitted in the Mentor's Orders page
 */

import { Prisma, User } from '@prisma/client'
import React, { useEffect, useState } from 'react'
import { Card, Button, Col, Row, Collapse, Form, Table } from 'react-bootstrap'
import styles from '@/styles/RequestCard.module.scss'
import { RequestDetails } from '@/lib/types'
import axios from 'axios'

interface RequestCardProps {
  details: RequestDetails
  onReject: () => void
  onApprove: () => void
  collapsed: boolean
}
 
const MentorRequestCard: React.FC<RequestCardProps> = ({
  details,
  onReject,
  onApprove,
  collapsed,
}) => {
  // state for the student that requested the order
  const [studentThatRequested, setStudentThatRequested] = useState<User>()
  // state for the collapse for request details
  const [collapse, setCollapse] = useState<boolean | undefined>(false)

  // Show cards by default and rerenders everytime collapsed changes
  useEffect(() => {
    setCollapse(collapsed)
  }, [collapsed])

  // Get the student that requested the order
  useEffect(() => {
    getStudentThatRequested()
    // getMentorThatApproved()
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

  return (
    <Row className='mb-4'>
      <Col>
        <Card style={{ backgroundColor: 'rgb(240, 240, 240)' }}>
          <Card.Body>
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

                    {/* <h6 className={styles.headingLabel}>Approved by:</h6>
                    <p>{mentorThatApproved?.email}</p> */}
                  </Col>

                  {/* REJECT/Approve BUTTONS */}
                  <Col xs={12} lg={5}>
                    <Button
                      variant='danger'
                      style={{ minWidth: '150px', marginRight: '20px' }}
                      onClick={onReject}
                    >
                      Reject
                    </Button>{' '}
                    <Button
                      variant='success'
                      style={{ minWidth: '150px', marginRight: '20px' }}
                      onClick={onApprove}
                    >
                      Approve
                    </Button>{' '}
                  </Col>
                </Row>

                <Row className='my-2'>
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
                          <tr key={itemIndex}>
                            <td>{itemIndex + 1}</td>
                            <td>{item.description}</td>
                            <td>{item.vendorID}</td>
                            <td>{item.url}</td>
                            <td>{item.partNumber}</td>
                            <td>{item.quantity}</td>
                            <td>{item.unitPrice.toString()}</td>
                            <td>
                              {(
                                item.quantity * (item.unitPrice as any)
                              ).toFixed(2)}
                            </td>
                            <td></td>
                            <td></td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </Table>
                </Row>
              </div>
            </Collapse>
          </Card.Body>
        </Card>
      </Col>
    </Row>
  )
}

export default MentorRequestCard
