import React from 'react'
import { Container, Row, Col, Card, Button } from 'react-bootstrap'

export default function mentor() {
  return (
    <>
    <Container>
        <Row className='big-row'>
            <Row className='small-row'>
                <Col Lg={10}>
                  <h3>Project 2: Point of Nerve Conduction Diagnostic | Capstone, Request</h3>
                </Col>
                <Col Lg={2}>
                  <h4>Budget: $100/500</h4>
                </Col>
            </Row>

            <Row className='small-row'>
              <Card>
                <Card.Body>
                  <Row className='smaller-row'>
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
                  <Row className='smaller-row'>
                    <Col>
                      <Button variant="danger" size="lg">REJECT</Button>{' '}
                      <Button variant="success" size="lg">APPROVE</Button>{' '}
                    </Col>
                    <Col>
                      <Button variant="dark" size="lg">REJECT</Button>{' '}
                      <Button variant="success" size="lg">APPROVE</Button>{' '}
                    </Col>

                  </Row>

                </Card.Body>

              </Card>

            </Row>
        </Row>
    </Container>
    </>
  )
}
