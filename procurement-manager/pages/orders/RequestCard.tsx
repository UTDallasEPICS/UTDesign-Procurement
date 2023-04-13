// RequestCard.tsx
import React from 'react';
import { Col, Row, Card, Button } from 'react-bootstrap';

interface RequestCardProps {
  requestNumber: number;
  dateRequested: string;
  dateNeeded: string;
  orderTotal: number;
  budgetUsed: string;
}

const RequestCard: React.FC<RequestCardProps> = ({
  requestNumber,
  dateRequested,
  dateNeeded,
  orderTotal,
  budgetUsed,
}) => {
  return (
    <Card style={{ backgroundColor: '#f8f9fa' }}>
      <Card.Body>
        <Row className="smaller-row">
          <Col>
            <h4>Request Number</h4>
            <h5>#{requestNumber}</h5>
          </Col>
          <Col>
            <h4>Date Requested</h4>
            <h5>{dateRequested}</h5>
          </Col>
          <Col>
            <h4>Date Needed</h4>
            <h5>{dateNeeded}</h5>
          </Col>
          <Col>
            <h5>Order Total: ${orderTotal}</h5>
            <h5>Budget Used: {budgetUsed}</h5>
          </Col>
        </Row>
        <Row className="smaller-row d-flex justify-content-between">
          <Col md="auto">
            <a href="#" className="text-info" style={{ textDecoration: 'underline' }}>
              View Request Form
            </a>
          </Col>
          <Col md="auto">
            <Button
              variant="success"
              size="lg"
              style={{ minWidth: '300px', marginRight: '40px' }}
            >
              APPROVE
            </Button>{' '}
            <Button
              variant="dark"
              size="lg"
              style={{ minWidth: '300px' }}
            >
              REJECT
            </Button>{' '}
          </Col>
        </Row>
      </Card.Body>
    </Card>
  );
};

export default RequestCard;
