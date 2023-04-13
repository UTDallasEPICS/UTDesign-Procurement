import React from 'react';
import { Row, Col, Button } from 'react-bootstrap';

interface ProjectHeaderProps {
  title: string;
  budget: string;
  isOpen: boolean;
  toggleCollapse: () => void;
}

const ProjectHeader: React.FC<ProjectHeaderProps> = ({ title, budget, isOpen, toggleCollapse }) => {
  return (
    <Row className="small-row">
      <Col lg={10}>
        <h3>{title}</h3>
      </Col>
      <Col lg={2} className="d-flex align-items-center justify-content-end">
        <h4 className="mr-2">{budget}</h4>
        <Button
          variant="outline-secondary"
          size="sm"
          onClick={toggleCollapse}
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
