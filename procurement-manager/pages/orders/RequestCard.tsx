import React from 'react';
import { Card, Button, Col, Row } from 'react-bootstrap';

interface RequestCardProps {
  requestNumber: number;
  dateRequested: string;
  dateNeeded: string;
  orderTotal: number;
  onReject: () => void;
}

const RequestCard: React.FC<RequestCardProps> = ({
  requestNumber,
  dateRequested,
  dateNeeded,
  orderTotal,
  onReject,
}) => {
  return (
    <Card className="request-card mb-3">
      <Card.Body>
        <Row>
          <Col>
            <Card.Title>
              <a href="#" className="text-primary">
                Request #{requestNumber}
              </a>
            </Card.Title>
          </Col>
          <Col>Order Total: ${orderTotal}</Col>
          <Col>Date Requested: {dateRequested}</Col>
          <Col>Date Needed: {dateNeeded}</Col>
          <Col xs="auto" className="d-flex align-items-center">
            <div className="d-flex align-items-start">
              <Button
                variant="success"
                size="sm"
                className="mb-2"
                onClick={() => console.log(`Request #${requestNumber} approved`)}
              >
                APPROVE
              </Button>{' '}
              <Button variant="dark" size="sm" onClick={onReject} className="ms-2">
                REJECT
              </Button>
            </div>
          </Col>
        </Row>
      </Card.Body>
    </Card>
  );
};

export default RequestCard;
