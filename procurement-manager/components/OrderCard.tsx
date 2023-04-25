import React from 'react';
import { Card, Button, Col, Row } from 'react-bootstrap';

interface RequestCardProps {
  orderNumber: number;
  dateRequested: string;
  orderSubTotal: number;
  shippingCost: number;
  orderTotal: number;
  orderStatus: string;
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
    <Card className="request-card mb-3"style={{ backgroundColor: 'rgb(240, 240, 240)' }}>
      <Card.Body>
        <Row>
          <Col>
            <Card.Title>
              <a href="#" className="text-primary">
                Order #{orderNumber}
              </a>
            </Card.Title>
          </Col>
          <Col>Date Requested: {dateRequested}</Col>
          <Col>Order Subtotal: ${orderSubTotal}</Col>
          <Col>Shipping Cost: ${shippingCost}</Col>
          <Col>Order Total: ${orderTotal}</Col>
          <Col>Status: {orderStatus}</Col>
          <Col xs="auto" className="d-flex align-items-center">
            <div className="d-flex align-items-start">
              <Button
                variant="success"
                size="sm"
                className="mb-2"
                onClick={() => console.log(`Request #${orderNumber} approved`)}
              >
                </Button>
            </div>
          </Col>
        </Row>
      </Card.Body>
    </Card>
  );
};

export default RequestCard;
