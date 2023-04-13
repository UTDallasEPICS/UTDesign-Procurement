import React, { useState } from 'react';
import { Container, Row, Collapse } from 'react-bootstrap';
import TopBarComponent from './TopBarComponent';
import RequestCard from './RequestCard';
import ProjectHeader from './ProjectHeader';

export default function Mentor() {
  const [isOpen, setIsOpen] = useState({ project1: true, project2: true });

  const toggleCollapse = (project: keyof typeof isOpen) => {
    setIsOpen({ ...isOpen, [project]: !isOpen[project] });
  };

  const project1Cards = [
    {
      requestNumber: 1,
      dateRequested: '4/11/2023',
      dateNeeded: '4/13/2023',
      orderTotal: 200,
      budgetUsed: 300,
      budgetTotal: 500,
    },
    {
      requestNumber: 2,
      dateRequested: '4/10/2023',
      dateNeeded: '4/15/2023',
      orderTotal: 150,
      budgetUsed: 450,
      budgetTotal: 500,
    },
  ];

  const project2Cards = [
    {
      requestNumber: 3,
      dateRequested: '4/9/2023',
      dateNeeded: '4/17/2023',
      orderTotal: 350,
      budgetUsed: 350,
      budgetTotal: 1000,
    },
  ];

  const project1Expenses = project1Cards.reduce((acc, card) => acc + card.orderTotal, 0);
  const project2Expenses = project2Cards.reduce((acc, card) => acc + card.orderTotal, 0);

  const project1Available = 500 - project1Expenses;
  const project2Available = 1000 - project2Expenses;

  return (
    <>
      <TopBarComponent />
      <Container>
        <Row className="big-row">
          <ProjectHeader
            projectName="Project 1: Diagnostic Capstone"
            expenses={project1Expenses}
            available={project1Available}
            budgetTotal={500}
            onToggleCollapse={() => toggleCollapse('project1')}
            isOpen={isOpen.project1}
          />
          <Collapse in={isOpen.project1}>
            <div>
              {project1Cards.map((card, index) => (
                <RequestCard
                  key={index}
                  requestNumber={card.requestNumber}
                  dateRequested={card.dateRequested}
                  dateNeeded={card.dateNeeded}
                  orderTotal={card.orderTotal}
                  budgetUsed={`$${card.budgetUsed} of $${card.budgetTotal}`}
                />
              ))}
            </div>
          </Collapse>
        </Row>
        <Row className="big-row">
          <ProjectHeader
            projectName="Project 2: Point of Nerve Conduction"
            expenses={project2Expenses}
            available={project2Available}
            budgetTotal={1000}
            onToggleCollapse={() => toggleCollapse('project2')}
            isOpen={isOpen.project2}
          />
          <Collapse in={isOpen.project2}>
            <div>
              {project2Cards.map((card, index) => (
                <RequestCard
                  key={index}
                  requestNumber={card.requestNumber}
                  dateRequested={card.dateRequested}
                  dateNeeded={card.dateNeeded}
                  orderTotal={card.orderTotal}
                  budgetUsed={`$${card.budgetUsed} of $${card.budgetTotal}`}
                />
              ))}
            </div>
          </Collapse>
        </Row>
      </Container>
    </>
);
}