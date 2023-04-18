import React from 'react';
import { Col, Button, Row } from 'react-bootstrap';

interface ProjectHeaderProps {
  projectName: string;
  expenses: number;
  available: number;
  budgetTotal: number;
  onToggleCollapse: () => void;
  isOpen: boolean;
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
    <Row className="align-items-center">
      <Col md={5}>
        <h3>{projectName}</h3>
      </Col>
      <Col md={2}>
        <p style={{ fontSize: '1.5rem' }}>
          <strong>Expenses:</strong> ${expenses}
        </p>
      </Col>
      <Col md={2}>
        <p style={{ fontSize: '1.5rem' }}>
          <strong>Available:</strong> ${available}
        </p>
      </Col>
      <Col md={2}>
        <p style={{ fontSize: '1.5rem' }}>
          <strong>Budget:</strong> ${budgetTotal}
        </p>
      </Col>
      <Col md={1}>
        <Button
          variant="outline-secondary"
          size="sm"
          onClick={onToggleCollapse}
          aria-controls="collapseContent"
          aria-expanded={isOpen}
        >
          {isOpen ? 'Hide' : 'Show'}
        </Button>
      </Col>
    </Row>
  );
};

export default ProjectHeader;
