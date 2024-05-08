// NOTE: Already created combined page for projects & order history so might not need this

/**
 * This is a static version of the Order History Page for the Admin.
 * May not have been updated to reflect the latest changes of the components that it is using
 */

import React, { useState } from 'react'
import { Container, Row, Collapse } from 'react-bootstrap'
import ProjectHeader from '@/components/ProjectHeader'
import ReimbursementCard from './history-reimbursement'
import RequestCard from './history-request'

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
      <Container>
        <Row>
          {/* <ProjectHeader
            title='Project 1: Project Name | Capstone, Request'
            budget='Budget: $100/$500'
            isOpen={isOpenProject1}
            toggleCollapse={toggleCollapseProject1}
          /> */}
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
          {/* <ProjectHeader
            projectName='Project 3: Point of Nerve Conduction Diagnostic | Capstone, Reimbursement'
            budgetTotal='Budget: $100/$500'
            isOpen={isOpenProject2}
            toggleCollapse={toggleCollapseProject2}
          /> */}
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
  )
}
