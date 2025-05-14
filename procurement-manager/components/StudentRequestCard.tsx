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

const StudentRequestCard: React.FC<RequestCardProps> = ({ details, collapsed }) => {
  const [studentThatRequested, setStudentThatRequested] = useState<User | null>(null)
  const [mentorThatApproved, setMentorThatApproved] = useState<User | null>(null)
  const [collapse, setCollapse] = useState<boolean>(collapsed)
  const [editable, setEditable] = useState<boolean>(false)
  const [resubmit, setResubmit] = useState<boolean>(false)
  const [vendorNames, setVendorNames] = useState<{ [key: string]: string }>({})
  const [inputValues, setInputValues] = useState(details.RequestItem.map(item => ({ ...item })))

  useEffect(() => {
    setCollapse(collapsed)
  }, [collapsed])

  useEffect(() => {
    getStudentThatRequested()
    getMentorThatApproved()
    fetchVendorNames()
  }, [])

  async function getStudentThatRequested() {
    try {
      const user = await axios.get(`/api/user/${details.studentID}`)
      if (user.status === 200) setStudentThatRequested(user.data)
    } catch (error) {
      console.error('Error fetching student:', error)
    }
  }

  async function getMentorThatApproved() {
    try {
      if (!details.process.mentorID) return
      const user = await axios.get(`/api/user/${details.process.mentorID}`)
      if (user.status === 200) setMentorThatApproved(user.data)
    } catch (error) {
      console.error('Error fetching mentor:', error)
    }
  }

  async function fetchVendorNames() {
    try {
      const vendorIds = [...new Set(details.RequestItem.map(item => item.vendorID))]
      const vendorData = await axios.get(`/api/vendor/get`)
      console.log(vendorData, "wertyujhtgfb")
      const vendorMap = Object.fromEntries(vendorData.data.map(v => [v.vendorID, v.vendorName]))
      setVendorNames(vendorMap)
    } catch (error) {
      console.error('Error fetching vendor names:', error)
    }
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>, index: number) {
    const { name, value } = e.target
    setInputValues(prev => prev.map((item, i) => (i !== index ? item : { ...item, [name]: value })))
  }

  function handleSave() {
    setEditable(false)
  }

  function handleResubmit(e: React.FormEvent) {
    e.preventDefault()
    setResubmit(false)
  }

  return (
    <Card className='request-card mb-3' style={{ backgroundColor: 'rgb(240, 240, 240)' }}>
      <Card.Body>
        <Row className='smaller-row'>
          <Col xs={12} lg={3}>
            <Card.Title>
              <h4 className={styles.headingLabel}>Request #{details.requestID}</h4>
            </Card.Title>
          </Col>
          <Col xs={6} lg={2}>
            <h6 className={styles.headingLabel}>Date Requested</h6>
            <p>{new Date(details.dateSubmitted).toLocaleDateString()}</p>
          </Col>
          <Col xs={6} lg={2}>
            <h6 className={styles.headingLabel}>Date Needed</h6>
            <p>{new Date(details.dateNeeded).toLocaleDateString()}</p>
          </Col>
          <Col xs={6} lg={2}>
            <h6 className={styles.headingLabel}>Order Subtotal</h6>
            <p>
              $
              {details.RequestItem.reduce(
                (total, item) =>
                  total + item.quantity * (item.unitPrice/100 as any),
                0
              ).toFixed(4)}
            </p>
          </Col>
          <Col xs={6} lg={3}>
            <h6 className={styles.headingLabel}>Status</h6>
            <p>{details.process.status}</p>
          </Col>
        </Row>
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

              {details.process.status === Status.REJECTED && (
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
                    {!details.process.adminProcessedComments
                      ? 'No Comments from Admin'
                      : 'Admin: ' + details.process.adminProcessedComments}
                  </p>
                  <p>
                    {!details.process.mentorProcessedComments
                      ? 'No Comments from Mentor'
                      : 'Mentor: ' + details.process.mentorProcessedComments}
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
                        <th>Item Status</th>
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
                            <td>{vendorNames[item.vendorID] || 'Loading...'}</td>
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
                                value={item.unitPrice/100}
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
                                    item.quantity * (item.unitPrice/100)
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
                            <td>
                              <p 
                                value={(
                                  //details.process.status
                                  item.status
                                )}
                              ></p>
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
