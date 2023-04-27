import React, { useEffect, useState } from 'react'
import { Container, Row, Col, Button, Collapse } from 'react-bootstrap'
import TopBarComponent from '../../components/TopBarComponent'
import RequestCard from '../../components/RequestCard'
import ProjectHeader from '../../components/ProjectHeader'
import RejectionModal from '../../components/RejectionModal'
import { Project } from '@prisma/client'
import axios from 'axios'
import { RequestDetails } from '@/lib/types'
import Head from 'next/head'

export default function Mentor() {
  // state for the different collapse projects
  const [isOpen, setIsOpen] = useState<boolean[]>([])
  // state for the modal for rejecting requests
  const [showRejectModal, setShowRejectModal] = useState(false)
  // state to set the request number for the reject modal to show
  const [rejectedRequestNumber, setRejectedRequestNumber] = useState<
    number | null
  >(null)
  // state for the requests inside the different projects associated to the user
  const [projectRequests, setProjectRequests] = useState<RequestDetails[][]>([])
  // state for the projects associated to the user
  const [projects, setProjects] = useState<Project[]>([])

  useEffect(() => {
    getMentor()
  }, [])

  async function getMentor() {
    const response = await axios.post('/api/request-form/get', {
      netID: 'def000000',
    })
    const [projects, requestsOfMultipleProjects] = await Promise.all([
      response.data.projects,
      response.data.requests,
    ])
    setProjects(projects)
    setProjectRequests(requestsOfMultipleProjects)
    setIsOpen(projects.map(() => true))
    console.log('isOpen: ', isOpen)
  }

  const toggleCollapse = (projectIndex: number) => {
    const newIsOpen = isOpen
    for (let i = 0; i < isOpen.length; i++) {
      if (i === projectIndex) {
        newIsOpen[i] = !newIsOpen[i]
      }
    }
    setIsOpen(newIsOpen)
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
      {/* <TopBarComponent /> */}
        {projects.map((project, projIndex) => {
          return (
            <Row className='big-row my-4' key={projIndex}>
              <ProjectHeader
                projectName={project.projectTitle}
                expenses={project.totalExpenses}
                available={project.startingBudget - project.totalExpenses}
                budgetTotal={project.startingBudget}
                onToggleCollapse={() => toggleCollapse(projIndex)}
                isOpen={isOpen[projIndex]}
              />
              <Collapse in={isOpen[projIndex]}>
                <div>
                  {projectRequests[projIndex].map((request, reqIndex) => (
                    <RequestCard
                      requestNumber={request.requestID}
                      dateRequested={request.dateSubmitted}
                      // calculates the subtotal by running a loop for each item in the request to add up the subtoal
                      orderTotal={request.RequestItem.reduce(
                        (total, item) => total + item.quantity * item.unitPrice,
                        0
                      )}
                      key={reqIndex}
                      {...request}
                      onReject={() => handleReject(request.requestID)}
                    />
                  ))}
                </div>
              </Collapse>
            </Row>
          )
        })}
      <RejectionModal
        show={showRejectModal}
        onHide={() => setShowRejectModal(false)}
        onSubmit={handleSubmitRejection}
      />
    </>
  )
}
