import React from 'react'
import { Container, Row, Col, Card, Button } from 'react-bootstrap'

export default function mentor() {
  return (
    <Container>
      <Row><Col><h1>UTD Procurement Manager</h1></Col></Row> 
      <Row>
        <h2>Project 2: Point of Care Nerve Conduction Diagnostic | Capstone, Request</h2>
      </Row>
      <Row>
        <button>Collapse</button>
        <Col><p>Order</p></Col> <Col><p>Date Requested</p></Col> <Col><p>Date Needed</p></Col> <Col><p>DEPT</p></Col> <Col><p>Status</p></Col>
      </Row>
      <Row>
        <Col><p>#4726</p></Col> <Col><p>1/1/1999</p></Col> <Col><p>1/1/2000</p></Col> <Col><p>BMEN</p></Col> <Col><p>SHIPPED</p></Col>
      </Row>

      <Row>
        <Col><p>Order total: $3272</p></Col> <Col><p>Requested by: John Doe | john.doe@utdallas.edu</p></Col>
      </Row>

      <Row>
      <Col><p>Budget used/total: $5674/$478329</p></Col> <Col><p>Mentor: John Doe | john.doe@utdallas.edu</p></Col>
      </Row>

      <Row>
      <Col><p>Expense Justification: Need new stuff</p></Col> <Col><p>Sponsor: UTSW</p></Col>      
      </Row>

      <Row>
        <Col><button> ACCEPT </button></Col> <Col><button> REJECT </button></Col>
      </Row>

      <p>______________________________________________________________________________________________________________________________________________________________________</p>
      <Row>
      <Col><p>Item #</p></Col> <Col><p>Description</p></Col> <Col><p>URL</p></Col> <Col><p>Part No.</p></Col> <Col><p>Qty.</p></Col> <Col><p>Unit Cost</p></Col> <Col><p>Total</p></Col> <Col><p>Item #</p></Col> <Col><p>Description</p></Col> <Col><p>URL#</p></Col> <Col><p>Part No.</p></Col> <Col><p>Qty.</p></Col> <Col><p>Unit Cost</p></Col> <Col><p>Order #</p></Col>
      </Row>

      <Row>
        <h2>Project 2: Point of Care Nerve Conduction Diagnostic | Capstone, Reimbursement</h2>
        <button>Collapse</button>
        <Col><p>Order</p></Col> <Col><p>Date</p></Col> <Col><p>Status</p></Col> <Col><p>UTD-ID</p></Col> <Col><p>NetID</p></Col> <Col><p>Faculty Advisor</p></Col>
      </Row>

      <Row>
      <Col><p>#4264</p></Col> <Col><p>1/1/1999</p></Col> <Col><p>PENDING</p></Col> <Col><p>43724728</p></Col> <Col><p>ABD129993</p></Col> <Col><p>John Doe | john.doe@utdallas.edu</p></Col>
      </Row>

      <Row>
        Student: John Doe | john.doe@utdallas.edu
      </Row>

      <Row>
        <Col><button> ACCEPT </button></Col> <Col><button> REJECT </button></Col>
      </Row>

      
      <p>______________________________________________________________________________________________________________________________________________________________________</p>
      <Row>
      <Col><p>Line #</p></Col> <Col><p>Receipt Date</p></Col> <Col><p>Vendor</p></Col> <Col><p>Description</p></Col> <Col><p>Receipt Total (w/o sales tax)</p></Col> 
      </Row>
    </Container>
  )
}
