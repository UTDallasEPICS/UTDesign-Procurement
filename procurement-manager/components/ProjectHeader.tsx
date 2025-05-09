/**
 * This component is seen in the Orders Page right before the cards. This can be reused in the Orders History Page.
 */

import { Prisma } from '@prisma/client'
import React from 'react'
import { Col, Button, Row, Stack } from 'react-bootstrap'

interface ProjectHeaderProps {
  projectName: string
  expenses: Prisma.Decimal
  available: Prisma.Decimal
  budgetTotal: Prisma.Decimal
  onToggleCollapse?: () => void
  isOpen?: boolean
}

const ProjectHeader: React.FC<ProjectHeaderProps> = ({
  projectName,
  expenses,
  available,
  budgetTotal,
  onToggleCollapse,
  isOpen
}) => {
  return (
    <Row className='align-items-center'>
      <Col>
        <h3>{projectName}</h3>
      </Col>
      <Col>
        <p style={{ fontSize: '1.15rem' }}>
          <strong>Expenses:</strong> ${expenses.toString()}
        </p>
      </Col>
      <Col>
        <p style={{ fontSize: '1.15rem' }}>
          <strong>Available:</strong> $<>{available.toString()}</>
        </p>
      </Col>
      <Col>
        <p style={{ fontSize: '1.15rem' }}>
          <strong>Budget:</strong> $<>{budgetTotal.toString()}</>
        </p>
      </Col>
      {isOpen !== undefined && onToggleCollapse !== undefined &&
      <Col>
        <Button
          variant='outline-secondary'
          size='sm'
          onClick={onToggleCollapse}
          aria-controls='collapseContent'
          aria-expanded={isOpen}
        >
          {isOpen ? 'Hide' : 'Show'}
        </Button>
      </Col>}
    </Row>
  )
}

export default ProjectHeader
