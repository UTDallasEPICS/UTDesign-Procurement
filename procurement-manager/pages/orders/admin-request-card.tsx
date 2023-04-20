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
                <h6>Request #</h6>
                <p>3</p>
              </Col>
              <Col>
                <h6>Date Requested</h6>
                <p>4/11/2023</p>
              </Col>
              <Col>
                <h6>Date Needed</h6>
                <p>4/13/2024</p>
              </Col>

              <Col>
                <h6>DEPT</h6>
                <p>BMEN</p>
              </Col>
              <Col>
                <h6>Status</h6>
                <p>Shipped</p>
              </Col>
              <Col>
                <h6>Order total</h6>
                <p>$1928</p>
              </Col>
            </Row>
            <Row className="smaller-row d-flex justify-content-between">
              <Col md="auto">
                <h6> Expense Justification: Need new stuff</h6> 
              </Col>
              <Col md = "auto"> <h6>Sponsor: UTSW</h6></Col>
              <Col md="auto">
                <Button
                  variant="dark"
                  size="md"
                  style={{ minWidth: '150px', marginRight: '20px' }}
                >
                  REJECT
                </Button>{' '}
                <Button
                  variant="success"
                  size="smdml"
                  style={{ minWidth: '150px', marginRight: '20px' }}
                >
                  APPROVE
                </Button>{' '}
              </Col>
            </Row>
            <Row className="person-info">
            <Col md="auto">
              <p>Requested by: Student | student@utdallas.edu</p>
            </Col>
            <Col md="auto">
              <p>Requested by: Mentor | mentor@utdallas.edu</p>
            </Col>
            </Row>
            <Row>
              <Col><h6>Item #</h6> <p>1</p></Col>
              
              <Col><h6>Description</h6> <p>hammer for hammering</p></Col>

              <Col>
                <h6>Vendor</h6>
                <p>Amazon</p>
              </Col>
              
              <Col><h6>URL</h6> <a href="#" className="text-info" style={{ textDecoration: 'underline' }}> Amazon </a></Col>
              
              <Col><h6>Part No.</h6> <p>2</p></Col>
              
              <Col><h6>Qty</h6> <p>1</p></Col>
              
              <Col><h6>Unit Cost</h6> <p>$100</p></Col>
              
              <Col><h6>Total</h6> <p>$200</p></Col>
              
              <Col><h6>Order #</h6></Col>
              
              <Col><h6>Tracking Info</h6></Col>
            </Row>
          </Card.Body>
        </Card>
      </Col>
    </Row>
  );
};

export default RequestCard;
