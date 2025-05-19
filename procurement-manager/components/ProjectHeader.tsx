/**
 * This component is seen in the Orders Page right before the cards. This can be reused in the Orders History Page.
 */

import { Col, Button, Row } from 'react-bootstrap'
import { dollarsAsString } from './NumberFormControl'

interface ProjectHeaderProps {
  projectName: string
  expenses: number
  available: number
  budgetTotal: number
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
          <strong>Expenses:</strong> {dollarsAsString(expenses/100)}
        </p>
      </Col>
      <Col>
        <p style={{ fontSize: '1.15rem' }}>
          <strong>Available:</strong> {dollarsAsString(available/100)}
        </p>
      </Col>
      <Col>
        <p style={{ fontSize: '1.15rem' }}>
          <strong>Budget:</strong> {dollarsAsString(budgetTotal/100)}
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
