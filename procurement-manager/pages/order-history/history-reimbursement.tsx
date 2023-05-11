/**
 * This is a static version of the Reimbursement history
 * May not have been updated to reflect the latest changes of the components that it is using
 */

import React from 'react'
import { Row, Col, Card, Button } from 'react-bootstrap'

const ReimbursementCard: React.FC = () => {
  return (
    <Row className='mb-4'>
      <Col>
        <Card style={{ backgroundColor: '#f8f9fa' }}>
          <Card.Body>
            <Row className='smaller-row'>
              <Col>
                <h6>Reimbursement #</h6>
                <p>3</p>
              </Col>
              <Col>
                <h6>Date</h6>
                <p>4/11/2023</p>
              </Col>
              <Col>
                <h6>UTD-ID</h6>
                <p>13218390</p>
              </Col>
              <Col>
                <h6>NetID</h6>
                <p>ABC1234567</p>
              </Col>
              <Col>
                <h6>Status</h6>
                <p>PENDING</p>
              </Col>
            </Row>
            <Row className='smaller-row d-flex justify-content-between'>
              <Col md='auto'>
                <p>Requested by: Student | student@utdallas.edu</p>
              </Col>
              <Col md='auto'>
                <p>Requested by: Mentor | mentor@utdallas.edu</p>
              </Col>
            </Row>
            <Row>
              <Col>
                <h6>Line #</h6> <p>1</p>
              </Col>

              <Col>
                <h6>Receipt Date</h6> <p>1/1/1999</p>
              </Col>

              <Col>
                <h6>Vendor</h6> <p>Amazon</p>
              </Col>

              <Col>
                <h6>Description</h6> <p>Nail part</p>
              </Col>

              <Col>
                <h6>Receipt Total (w/o sales tax)</h6> <p>$643</p>
              </Col>
            </Row>
          </Card.Body>
        </Card>
      </Col>
    </Row>
  )
}

export default ReimbursementCard
