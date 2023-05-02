// RequestCard.tsx
import React from 'react';
import { Row, Col, Card, Button } from 'react-bootstrap';
import MyTextbox from './textbox';

const RequestCard (){
  return (
    <Row className="mb-4">
      <Col>
        <Card style={{ backgroundColor: '#f8f9fa' }}>
          <Card.Body>
            <Row className="smaller-row">
              <Col>
                <h6>Request #</h6>
                <p>{requestNumber}</p>
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
              <p>Approved by: Mentor | mentor@utdallas.edu</p>
            </Col>
            </Row>
            <Row>
              <Col><h6>Item #</h6> <p>1</p></Col>
              
              <Col><h6>Description</h6> <p>hammer for hammering</p></Col>

              <Col>
                <h6>Vendor</h6>
                <p>Amazon</p>
              </Col>
              
              <Col>
  <h6>URL</h6>
  <a
    href="https://www.amazon.com/500pcs-Hardware-Nickel-Hanging-Picture/dp/B08VW552CJ/ref=sr_1_2_sspa?crid=3HSZV3218CARE&keywords=nails&qid=1682626692&sprefix=n%2Caps%2C175&sr=8-2-spons&psc=1&spLa=ZW5jcnlwdGVkUXVhbGlmaWVyPUEzUkxaVTRQMEpZNVczJmVuY3J5cHRlZElkPUEwMDgyNDA0TEpaSzZDMzhOQUYzJmVuY3J5cHRlZEFkSWQ9QTAzODEyNjlHVFZGSkdWVTBINVImd2lkZ2V0TmFtZT1zcF9hdGYmYWN0aW9uPWNsaWNrUmVkaXJlY3QmZG9Ob3RMb2dDbGljaz10cnVl" target="_blank"
    className="text-info"
    style={{ textDecoration: 'underline' }}
    title="https://www.amazon.com/500pcs-Hardware-Nickel-Hanging-Picture/dp/B08VW552CJ/ref=sr_1_2_sspa?crid=3HSZV3218CARE&keywords=nails&qid=1682626692&sprefix=n%2Caps%2C175&sr=8-2-spons&psc=1&spLa=ZW5jcnlwdGVkUXVhbGlmaWVyPUEzUkxaVTRQMEpZNVczJmVuY3J5cHRlZElkPUEwMDgyNDA0TEpaSzZDMzhOQUYzJmVuY3J5cHRlZEFkSWQ9QTAzODEyNjlHVFZGSkdWVTBINVImd2lkZ2V0TmFtZT1zcF9hdGYmYWN0aW9uPWNsaWNrUmVkaXJlY3QmZG9Ob3RMb2dDbGljaz10cnVl"
  >
    Amazon
  </a>
</Col>
              
              <Col><h6>Part No.</h6> <p>2</p></Col>
              
              <Col><h6>Qty</h6> <p>1</p></Col>
              
              <Col><h6>Unit Cost</h6> <p>$100</p></Col>
              
              <Col><h6>Total</h6> <p>$200</p></Col>
              
              <Col><h6>Order #</h6> <MyTextbox /></Col>
              
              <Col><h6>Tracking</h6>  <MyTextbox /> </Col>
            </Row>
          </Card.Body>
        </Card>
      </Col>
    </Row>
  );
};

export default RequestCard;
