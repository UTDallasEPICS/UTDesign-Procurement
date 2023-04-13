// RequestCard.tsx
import React from 'react';
import { Button, Card } from 'react-bootstrap';

interface RequestCardProps {
  requestNumber: number;
  dateRequested: string;
  dateNeeded: string;
  orderTotal: number;
}

const RequestCard: React.FC<RequestCardProps> = ({ requestNumber, dateRequested, dateNeeded, orderTotal }) => {
  return (
    <Card className="mb-2" style={{ backgroundColor: '#f8f9fa' }}>
      <Card.Body className="d-flex justify-content-between align-items-center">
        <a href="#" className="text-primary font-weight-bold">
          Request #{requestNumber}
        </a>
        <span className="font-weight-bold mr-2">Order Total: ${orderTotal}</span>
        <span className="font-weight-bold mr-2">Date Requested: {dateRequested}</span>
        <span className="font-weight-bold mr-2">Date Needed: {dateNeeded}</span>
        <Button variant="success" size="sm">
          APPROVE
        </Button>
        <Button variant="dark" size="sm">
          REJECT
        </Button>
      </Card.Body>
    </Card>
  );
};

export default RequestCard;
