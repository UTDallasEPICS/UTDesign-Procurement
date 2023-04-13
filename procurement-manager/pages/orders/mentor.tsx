import React, { useState } from 'react';
import { Container, Row, Col, Card, Button, Collapse } from 'react-bootstrap';
import TopBarComponent from './TopBarComponent';

export default function Mentor() {
  const [isOpen, setIsOpen] = useState(true);

  const toggleCollapse = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      <TopBarComponent />
      <Container>
        <Row className="big-row">
          <Row className="small-row">
            <Col lg={10}>
              <h3>
                Project 2: Point of Nerve Conduction Diagnostic | Capstone,
                Request
              </h3>
            </Col>
            <Col lg={2} className="d-flex align-items-center justify-content-end">
              <h4 className="mr-2">Budget: $100/500</h4>
              <Button
                variant="outline-secondary"
                size="sm"
                onClick={toggleCollapse}
                aria-controls="collapseContent"
                aria-expanded={isOpen}
              >
                {isOpen ? 'Hide' : 'Show'}
              </Button>
            </Col>
          </Row>
          <Collapse in={isOpen}>
            <div id="collapseContent">
              <Row className="small-row">
                <Card>
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
                          style={{ minWidth: '300px', marginRight: '40px' }}
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
              </Row>
            </div>
          </Collapse>
        </Row>
      </Container>
    </>
  );
}
