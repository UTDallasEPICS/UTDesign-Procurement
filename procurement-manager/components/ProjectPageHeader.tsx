/**
 * This component is seen in the Orders Page right before the cards. This can be reused in the Orders History Page.
 */

import { Prisma } from '@prisma/client'
import React from 'react'
import { Col, Button, Row } from 'react-bootstrap'

interface ProjectPageHeaderProps {
  projectID: number
  onToggleCollapse: () => void
  isOpen: boolean
}

const ProjectPageHeader: React.FC<ProjectPageHeaderProps> = ({
  projectID,
  onToggleCollapse,
  isOpen,
}) => {
  return (
    <Row className='align-items-center'>
      <Col md={11}>
        <h3>Project {projectID}</h3>
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

export default ProjectPageHeader