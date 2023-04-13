// Mentor.tsx
import React, { useState } from 'react';
import { Container, Row, Col, Button, Collapse } from 'react-bootstrap';
import TopBarComponent from './TopBarComponent';
import RequestCard from './RequestCard'; // Import the RequestCard component

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
                <RequestCard /> {/* Use the RequestCard component */}
                <RequestCard />
              </Row>
            </div>
          </Collapse>
        </Row>
      </Container>
    </>
  );
}
