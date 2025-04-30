/**
 * This component is seen in the Orders Page right before the cards. This can be reused in the Orders History Page.
 */

import { Prisma } from '@prisma/client'
import React from 'react'
import { Col, Button, Row } from 'react-bootstrap'

interface ProjectHeaderProps {
  projectName: string
  expenses: Prisma.Decimal
  available: Prisma.Decimal
  budgetTotal: Prisma.Decimal
  onToggleCollapse: () => void
  isOpen: boolean
}

const ProjectHeader: React.FC<ProjectHeaderProps> = ({
  projectName,
  expenses,
  available,
  budgetTotal,
  onToggleCollapse,
  isOpen,
}) => {
  return (
    <Row className='align-items-center'>
      <Col md={5}>
        <h3>{projectName}</h3>
      </Col>
      <Col md={2}>
        <p style={{ fontSize: '1.5rem' }}>
          <strong>Expenses:</strong> $<>{expenses/100}</>
        </p>
      </Col>
      <Col md={2}>
        <p style={{ fontSize: '1.5rem' }}>
          <strong>Available:</strong> $<>{available.toString()}</>
        </p>
      </Col>
      <Col md={2}>
        <p style={{ fontSize: '1.5rem' }}>
          <strong>Budget:</strong> $<>{budgetTotal}</>
        </p>
      </Col>
      <Col md={1}>
        <Button
          variant='outline-secondary'
          size='sm'
          onClick={onToggleCollapse}
          aria-controls='collapseContent'
          aria-expanded={isOpen}
        >
          {isOpen ? 'Hide' : 'Show'}
        </Button>
      </Col>
    </Row>
  )
}

export default ProjectHeader
