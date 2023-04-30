// RequestCard.tsx
import { prisma } from '@/db'
import { RequestDetails } from '@/lib/types'
import { Status, User } from '@prisma/client'
import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { Row, Col, Card, Button } from 'react-bootstrap'

interface AdminRequestCardProps {
  details: RequestDetails
  onReject: () => void
}

const AdminRequestCard: React.FC<AdminRequestCardProps> = ({
  details,
  // onReject,
}) => {
  const [user, setUser] = useState<User>()

  useEffect(() => {
    getUser(details.studentID).then((user) => setUser(user))
  })

  async function getUser(id: number) {
    try {
      const response = await axios.get(`/api/user/${id}`)
      setUser(response.data)
    } catch (error) {
      console.log(error.messasge)
    }
  }

  return (
    <Row className='mb-4'>
      <Col>
        <Card style={{ backgroundColor: '#f8f9fa' }}>
          <Card.Body>
            <Row className='smaller-row'>
              <Col>
                <h6>Request #</h6>
                <p>{details.requestID}</p>
              </Col>
              <Col>
                <h6>Date Requested</h6>
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
              <Col>
                <h6>Date Needed</h6>
                <p>
                  {new Date(details.dateNeeded).toLocaleDateString(undefined, {
                    weekday: 'short',
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })}
                </p>
              </Col>

              <Col>
                <h6></h6>
                <p></p>
              </Col>
              <Col>
                <h6>Status</h6>
                <p>{details.Process[0].status}</p>
              </Col>
              <Col>
                <h6>Order total</h6>
                <p>
                  $
                  {details.RequestItem.reduce(
                    (total, item) => total + item.quantity * item.unitPrice,
                    0
                  ).toFixed(2)}
                </p>
              </Col>
            </Row>
            <Row className='my-4 smaller-row d-flex justify-content-between'>
              <Col md='auto'>
                <h6>
                  Expense Justification:{' '}
                  {!details.justification ? 'none' : details.justification}
                </h6>
              </Col>
              <Col md='auto'>
                {' '}
                <h6>Sponsor: {details.project.sponsorCompany}</h6>
              </Col>
              <Col md='auto'>
                <Button
                  variant='dark'
                  // size='md'
                  style={{ minWidth: '150px', marginRight: '20px' }}
                >
                  REJECT
                </Button>{' '}
                <Button
                  variant='success'
                  // size='smdml'
                  style={{ minWidth: '150px', marginRight: '20px' }}
                >
                  APPROVE
                </Button>{' '}
              </Col>
            </Row>
            <Row className='person-info'>
              <Col md='auto'>
                <p>Requested by: {details.studentID}</p>
              </Col>
              <Col md='auto'>
                <p>Approved by: {details.Process[0].mentorID}</p>
              </Col>
            </Row>

            {/* List of Items */}
            {details.RequestItem.map((item) => {
              return (
                <Row className='mb-2'>
                  <Col>
                    <h6>Item #</h6>
                    <p>{item.itemID}</p>
                  </Col>
                  <Col>
                    <h6>Description</h6>
                    <p>{item.description}</p>
                  </Col>
                  <Col>
                    <h6>Vendor</h6>
                    <p>{item.vendorID}</p>
                  </Col>
                  <Col>
                    <h6>URL</h6>
                    <p>{item.url}</p>
                  </Col>
                  <Col>
                    <h6>Part #</h6>
                    <p>{item.partNumber}</p>
                  </Col>
                  <Col>
                    <h6>Qty</h6>
                    <p>{item.quantity}</p>
                  </Col>
                  <Col>
                    <h6>Unit Price</h6>
                    <p>${item.unitPrice}</p>
                  </Col>
                  <Col>
                    <h6>Total</h6>
                    <p>${(item.quantity * item.unitPrice).toFixed(2)}</p>
                  </Col>
                  <Col>
                    <h6>Order #</h6>
                  </Col>
                  <Col>
                    <h6>Tracking Info</h6>
                  </Col>
                </Row>
              )
            })}
            {/* <Row>
              <Col>
                <h6>Item #</h6> <p>1</p>
              </Col>

              <Col>
                <h6>Description</h6> <p>hammer for hammering</p>
              </Col>

              <Col>
                <h6>Vendor</h6>
                <p>Amazon</p>
              </Col>

              <Col>
                <h6>URL</h6>{' '}
                <a
                  href='#'
                  className='text-info'
                  style={{ textDecoration: 'underline' }}
                >
                  {' '}
                  Amazon{' '}
                </a>
              </Col>

              <Col>
                <h6>Part No.</h6> <p>2</p>
              </Col>

              <Col>
                <h6>Qty</h6> <p>1</p>
              </Col>

              <Col>
                <h6>Unit Cost</h6> <p>$100</p>
              </Col>

              <Col>
                <h6>Total</h6> <p>$200</p>
              </Col>

              <Col>
                <h6>Order #</h6>
              </Col>

              <Col>
                <h6>Tracking Info</h6>
              </Col>
            </Row> */}
          </Card.Body>
        </Card>
      </Col>
    </Row>
  )
}

export default AdminRequestCard
