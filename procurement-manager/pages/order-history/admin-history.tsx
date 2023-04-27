<<<<<<< HEAD:procurement-manager/pages/orders/admin-orders.tsx
import React, { useState } from 'react';
import { Container, Row, Collapse } from 'react-bootstrap';
import TopBarComponent from './TopBarComponent';
import RequestCard from './admin-request-card';
import ProjectHeader from './ProjectHeader';
import ReimbursementCard from './admin-reimbursement-card';
import MyTextbox from './textbox-function';
=======
import React, { useState } from 'react'
import { Container, Row, Collapse } from 'react-bootstrap'
import TopBarComponent from '@/components/TopBarComponent'
import ProjectHeader from '@/components/ProjectHeader'
import ReimbursementCard from './history-reimbursement'
import RequestCard from './history-request'
>>>>>>> origin/isaac:procurement-manager/pages/order-history/admin-history.tsx

export default function Mentor() {
  const [isOpenProject1, setIsOpenProject1] = useState(true)
  const [isOpenProject2, setIsOpenProject2] = useState(true)

  const toggleCollapseProject1 = () => {
    setIsOpenProject1(!isOpenProject1)
  }

  const toggleCollapseProject2 = () => {
    setIsOpenProject2(!isOpenProject2)
  }

  return (
    <>
      <TopBarComponent />
      <Container>
        <Row>
          <ProjectHeader
<<<<<<< HEAD:procurement-manager/pages/orders/admin-orders.tsx
            title="Project 1: Project Name | Capstone, Request"
            budget="Budget: $100.00/$500.00"
=======
            title='Project 1: Project Name | Capstone, Request'
            budget='Budget: $100/$500'
>>>>>>> origin/isaac:procurement-manager/pages/order-history/admin-history.tsx
            isOpen={isOpenProject1}
            toggleCollapse={toggleCollapseProject1}
          />
          <Collapse in={isOpenProject1}>
            <div>
              <Row>
                <RequestCard />
                <RequestCard />
              </Row>
            </div>
          </Collapse>
        </Row>
        <Row>
          <ProjectHeader
<<<<<<< HEAD:procurement-manager/pages/orders/admin-orders.tsx
            title="Project 3: Point of Nerve Conduction Diagnostic | Capstone, Reimbursement"
            budget="Budget: $100.00/$500.00"
=======
            title='Project 3: Point of Nerve Conduction Diagnostic | Capstone, Reimbursement'
            budget='Budget: $100/$500'
>>>>>>> origin/isaac:procurement-manager/pages/order-history/admin-history.tsx
            isOpen={isOpenProject2}
            toggleCollapse={toggleCollapseProject2}
          />
          <Collapse in={isOpenProject2}>
            <div>
              <Row>
                <ReimbursementCard />
                <ReimbursementCard />
              </Row>
            </div>
          </Collapse>
        </Row>
      </Container>
    </>
<<<<<<< HEAD:procurement-manager/pages/orders/admin-orders.tsx
  );
}
=======
  )
}
>>>>>>> origin/isaac:procurement-manager/pages/order-history/admin-history.tsx
