// RequestCard.tsx
import React from 'react';
import { Row, Col, Card, Button } from 'react-bootstrap';

const RequestCard: React.FC = () => {
  return (
    <Row className="mb-4">
      <Col>
        <Card style={{ backgroundColor: '#f8f9fa' }}>
          <Card.Body>
            <Row className="smaller-row">
              <Col>
                <h4>Request Number</h4>
                <h5>#1</h5>
              </Col>
              <Col>
                <h4>Date Requested</h4>
                <h5>4/11/2023</h5>
              </Col>
              <Col>
                <h4>Date Needed</h4>
                <h5>4/13/2023</h5>
              </Col>
              <Col>
                <h5>Order Total: $200</h5>
                <h5>Budget Used: $300/500</h5>
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
                  variant="dark"
                  size="lg"
                  style={{ minWidth: '300px', marginRight: '20px' }}
                >
                  REJECT
                </Button>{' '}
                <Button
                  variant="success"
                  size="lg"
                  style={{ minWidth: '300px' }}
                >
                  APPROVE
                </Button>{' '}
              </Col>
            </Row>
          </Card.Body>
        </Card>
      </Col>
    </Row>
  );
};

export default RequestCard;
