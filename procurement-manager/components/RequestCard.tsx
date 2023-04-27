import React from 'react'
import { Card, Button, Col, Row } from 'react-bootstrap'

interface RequestCardProps {
  requestNumber: number
  dateRequested: Date
  dateNeeded: Date
  orderTotal: number
  onReject: () => void
}

const RequestCard: React.FC<RequestCardProps> = ({
  requestNumber,
  dateRequested,
  dateNeeded,
  orderTotal,
  onReject,
}) => {
  return (
    <Card className='request-card mb-3'>
      <Card.Body>
        <Row>
          <Col>
            <Card.Title>
              <a href='#' className='text-primary'>
                Request #{requestNumber}
              </a>
            </Card.Title>
          </Col>
          <Col>
            <p>Order Total:</p>
            <p>${orderTotal.toFixed(2)}</p>
          </Col>
          <Col>
            <p>Date Requested: </p>
            <p>
              {new Date(dateRequested).toLocaleDateString(undefined, {
                weekday: 'short',
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              })}
            </p>
          </Col>
          <Col>
            <p>Date Needed:</p>
            <p>
              {new Date(dateNeeded).toLocaleDateString(undefined, {
                weekday: 'short',
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              })}
            </p>
          </Col>
          <Col xs='auto' className='d-flex align-items-center'>
            <div className='d-flex align-items-start'>
              <Button
                variant='success'
                size='sm'
                className='mb-2'
                onClick={() =>
                  console.log(`Request #${requestNumber} approved`)
                }
              >
                APPROVE
              </Button>{' '}
              <Button
                variant='dark'
                size='sm'
                onClick={onReject}
                className='ms-4'
              >
                REJECT
              </Button>
            </div>
          </Col>
        </Row>
      </Card.Body>
    </Card>
  )
}

export default RequestCard
