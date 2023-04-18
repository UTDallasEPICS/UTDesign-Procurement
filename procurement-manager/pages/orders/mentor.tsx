import React, { useState } from 'react'
import { Container, Row, Col, Button, Collapse } from 'react-bootstrap'
import TopBarComponent from '../../components/TopBarComponent'
import RequestCard from '../../components/RequestCard'
import ProjectHeader from '../../components/ProjectHeader'
import RejectionModal from '../../components/RejectionModal'

export default function Mentor() {
  const [isOpen, setIsOpen] = useState({ project1: true, project2: true })
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [rejectedRequestNumber, setRejectedRequestNumber] = useState<
    number | null
  >(null)

  const toggleCollapse = (project: keyof typeof isOpen) => {
    setIsOpen({ ...isOpen, [project]: !isOpen[project] })
  }

  const handleReject = (requestNumber: number) => {
    setRejectedRequestNumber(requestNumber)
    setShowRejectModal(true)
  }

  const handleSubmitRejection = (reason: string) => {
    console.log(
      `Request #${rejectedRequestNumber} rejected with reason: ${reason}`
    )
    setShowRejectModal(false)
  }

  // Define the cards for each project
  const project1Cards = [
    {
      requestNumber: 1,
      dateRequested: '4/11/2023',
      dateNeeded: '4/13/2023',
      orderTotal: 200,
    },
    {
      requestNumber: 2,
      dateRequested: '4/10/2023',
      dateNeeded: '4/15/2023',
      orderTotal: 150,
    },
    {
      requestNumber: 3,
      dateRequested: '4/10/2023',
      dateNeeded: '4/20/2023',
      orderTotal: 150,
    },
  ]

  const project2Cards = [
    {
      requestNumber: 4,
      dateRequested: '4/9/2023',
      dateNeeded: '4/17/2023',
      orderTotal: 350,
    },
    {
      requestNumber: 5,
      dateRequested: '4/8/2023',
      dateNeeded: '4/18/2023',
      orderTotal: 100,
    },
  ]

  // Calculate the total expenses for each project
  const project1Expenses = project1Cards.reduce(
    (acc, card) => acc + card.orderTotal,
    0
  )
  const project2Expenses = project2Cards.reduce(
    (acc, card) => acc + card.orderTotal,
    0
  )

  return (
    <>
      <TopBarComponent />
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
            <div>
              {project1Cards.map((card, index) => (
                <RequestCard
                  key={index}
                  {...card}
                  onReject={() => handleReject(card.requestNumber)}
                />
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
            <div>
              {project2Cards.map((card, index) => (
                <RequestCard
                  key={index}
                  {...card}
                  onReject={() => handleReject(card.requestNumber)}
                />
              ))}
            </div>
          </Collapse>
        </Row>
      </Container>
      <RejectionModal
        show={showRejectModal}
        onHide={() => setShowRejectModal(false)}
        onSubmit={handleSubmitRejection}
      />
    </>
  )
}
