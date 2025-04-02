/**
 * This component is the card that the Admin will see in the Orders Page
 */
import React, { useEffect, useState } from 'react'
import { prisma } from '@/db'
import { ReimbursementDetails } from '@/lib/types'
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
import { Prisma, User, Project, Vendor, Order, ReimbursementItem } from '@prisma/client'
import axios from 'axios'

interface AdminReimbursementCardProps {
  user: User
  project: Project
  details: ReimbursementDetails
  onReject: () => void
  onSave: () => void
  collapsed: boolean
}

const AdminReimbursementCard: React.FC<AdminReimbursementCardProps> = ({
  user,
  project,
  details,
  onReject,
  onSave,
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
      if (!details.process.mentorID) return null
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
      if (!details.process.mentorID) return null
      const user = await axios.get(`/api/user/${details.process.mentorID}`)
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
            <Row className='smaller-row'>

              {/* REQUEST NUMBER */}
              <Col xs={12} lg={3}>
                <Card.Title>
                  <h4 className={styles.headingLabel}>
                    Reimbursement #{details.reimbursementID}
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

              {/* ORDER SUBTOTAL */}
              <Col xs={6} lg={2}>
                <h6 className={styles.headingLabel}>Order Subtotal</h6>
                <p>
                  $
                  {details.ReimbursementItem.reduce(
                    (total, item) =>
                      total + 1 * (item.receiptTotal as any),
                    0
                  ).toFixed(2)}
                </p>
              </Col>

              {/* STATUS */}
              <Col xs={6} lg={3}>
                <h6 className={styles.headingLabel}>Status</h6>
                <p>{details.process.status}</p>
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
                  <Table responsive striped>
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Receipt Date</th>
                        <th>Vendor</th>
                        <th>Description</th>
                        <th>Receipt Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {details.ReimbursementItem.map((item, itemIndex) => {
                        return (
                          <tr key={itemIndex}>
                            <td>{itemIndex + 1}</td>
                            <td>{new Date(item.receiptDate).toLocaleDateString(undefined, {
                                weekday: 'short',
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                            })}</td>
                            <td>{item.vendorID}</td>
                            <td>{item.description}</td>
                            <td>{item.receiptTotal.toString()}</td>
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

export default AdminReimbursementCard
