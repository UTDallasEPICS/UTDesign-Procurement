import React, { useState } from 'react'
import { Container, Row, Col, Button, Collapse } from 'react-bootstrap'
import TopBarStudent from '../../components/TopBarStudent'
import OrderCard from '../../components/OrderCard'
import ProjectHeader from '../../components/ProjectHeader'

export default function Student() {
  const [isOpen, setIsOpen] = useState({ project1: true, project2: true })

  type ProjectType = 'project1' | 'project2'

  const toggleCollapse = (project: ProjectType) => {
    setIsOpen({ ...isOpen, [project]: !isOpen[project] })
  }

  const project1Cards = [
    {
      orderNumber: 1,
      dateRequested: '4/11/2023',
      orderSubTotal: 170,
      shippingCost: 30,
      orderTotal: 200,
      dateOrdered: '4/12/2023',
      orderStatus: 'Completed',
    },
    {
      orderNumber: 2,
      dateRequested: '4/16/2023',
      orderSubTotal: 170,
      shippingCost: 30,
      orderTotal: 200,
      dateOrdered: '4/18/2023',
      orderStatus: 'Pending',
    },
  ]

  const project2Cards = [
    {
      orderNumber: 1,
      dateRequested: '4/13/2023',
      orderSubTotal: 150,
      shippingCost: 20,
      orderTotal: 170,
      dateOrdered: '4/14/2023',
      orderStatus: 'Shipped',
    },
    {
      orderNumber: 2,
      dateRequested: '4/16/2023',
      orderSubTotal: 170,
      shippingCost: 30,
      orderTotal: 200,
      dateOrdered: '4/18/2023',
      orderStatus: 'Pending',
    },
  ]

  const project1Expenses = project1Cards.reduce(
    (acc, card) => acc + (card.shippingCost || 0) + (card.orderSubTotal || 0),
    0
  )

  const project2Expenses = project2Cards.reduce(
    (acc, card) => acc + (card.shippingCost || 0) + (card.orderSubTotal || 0),
    0
  )

  return (
    <>
      {/* <TopBarStudent /> */}
      <Container>
        <Row className='big-row'>
          <ProjectHeader
            projectName='Project 1: Diagnostic Capstone'
            expenses={project1Expenses}
            available={500 - project1Expenses}
            budgetTotal={500}
            onToggleCollapse={() => toggleCollapse('project1')}
            isOpen={isOpen.project1}
          />
          <Collapse in={isOpen.project1}>
            <div className='w-100'>
              {project1Cards.map((card, index) => (
                <OrderCard key={index} {...card} />
              ))}
            </div>
          </Collapse>
        </Row>
        <Row className='big-row'>
          <ProjectHeader
            projectName='Project 2: Point of Nerve Conduction'
            expenses={project2Expenses}
            available={1000 - project2Expenses}
            budgetTotal={1000}
            onToggleCollapse={() => toggleCollapse('project2')}
            isOpen={isOpen.project2}
          />
          <Collapse in={isOpen.project2}>
            <div className='w-100'>
              {project2Cards.map((card, index) => (
                <OrderCard key={index} {...card} />
              ))}
            </div>
          </Collapse>
        </Row>
      </Container>
    </>
  )
}
