// Mentor.tsx
import React, { useState } from 'react';
import { Container, Row, Collapse } from 'react-bootstrap';
import TopBarComponent from './TopBarComponent';
import RequestCard from './RequestCard';
import ProjectHeader from './ProjectHeader';

export default function Mentor() {
  const [isOpenProject1, setIsOpenProject1] = useState(true);
  const [isOpenProject2, setIsOpenProject2] = useState(true);

  const toggleCollapseProject1 = () => {
    setIsOpenProject1(!isOpenProject1);
  };

  const toggleCollapseProject2 = () => {
    setIsOpenProject2(!isOpenProject2);
  };

  return (
    <>
      <TopBarComponent />
      <Container>
        <Row>
          <ProjectHeader
            title="Project 1: Project Name | Capstone, Request"
            budget="Budget: $100/500"
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
            title="Project 2: Point of Nerve Conduction Diagnostic | Capstone, Request"
            budget="Budget: $100/500"
            isOpen={isOpenProject2}
            toggleCollapse={toggleCollapseProject2}
          />
          <Collapse in={isOpenProject2}>
            <div>
              <Row>
                <RequestCard />
                <RequestCard />
              </Row>
            </div>
          </Collapse>
        </Row>
      </Container>
    </>
  );
}
