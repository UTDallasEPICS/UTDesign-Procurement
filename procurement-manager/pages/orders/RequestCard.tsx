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
    <Card className="mb-2">
      <Card.Body className="d-flex justify-content-between align-items-center">
        <a href="#" className="text-dark">
          Request {requestNumber}
        </a>
        <span>Order Total: ${orderTotal}</span>
        <span>Date Requested: {dateRequested}</span>
        <span>Date Needed: {dateNeeded}</span>
        <Button variant="success" size="sm">
          Approve
        </Button>
        <Button variant="dark" size="sm">
          Reject
        </Button>
      </Card.Body>
    </Card>
  );
};

export default RequestCard;
