import React from 'react'
import { Card, Button, Col, Row } from 'react-bootstrap'

interface RequestCardProps {
  orderNumber: number
  dateRequested: Date
  orderSubTotal: number
  shippingCost: number
  orderTotal: number
  orderStatus: string
}

const RequestCard: React.FC<RequestCardProps> = ({
  orderNumber,
  dateRequested,
  orderSubTotal,
  shippingCost,
  orderTotal,
  orderStatus,
}) => {
  return (
    <Card
      className='request-card mb-3'
      style={{ backgroundColor: 'rgb(240, 240, 240)' }}
    >
      <Card.Body>
        <Row>
          <Col>
            <Card.Title>
              <a href='#' className='text-primary'>
                Order #{orderNumber}
              </a>
            </Card.Title>
          </Col>
          <Col>
            <h6>Date Requested:</h6>
            <p>
              {new Date(dateRequested).toLocaleDateString(undefined, {
                weekday: 'short',
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              })}
            </p>
          </Col>
          <Col>Order Subtotal: ${orderSubTotal.toFixed(2)}</Col>
          <Col>Shipping Cost: ${shippingCost.toFixed(2)}</Col>
          <Col>Order Total: ${orderTotal.toFixed(2)}</Col>
          <Col>Status: {orderStatus}</Col>
          <Col xs='auto' className='d-flex align-items-center'>
            <div className='d-flex align-items-start'></div>
          </Col>
        </Row>
      </Card.Body>
    </Card>
  )
}

export default RequestCard
