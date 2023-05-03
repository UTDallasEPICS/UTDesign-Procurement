import React, { useEffect, useState } from 'react'
import { Container, Row, Col, Button, Collapse } from 'react-bootstrap'
import OrderCard from '../../components/OrderCard'
import ProjectHeader from '../../components/ProjectHeader'
import { useSession } from 'next-auth/react'
import { Project, User } from '@prisma/client'
import { RequestDetails } from '@/lib/types'
import axios from 'axios'

export default function Student() {
  // const [isOpen, setIsOpen] = useState({ project1: true, project2: true })
  const { data: session } = useSession()
  const user = session?.user as User
  const [isOpen, setIsOpen] = useState<boolean[]>([])
  // state for the requests inside the different projects associated to the user
  const [projectRequests, setProjectRequests] = useState<RequestDetails[][]>([])
  // state for the projects associated to the user
  const [projects, setProjects] = useState<Project[]>([])

  // type ProjectType = 'project1' | 'project2'

  // const toggleCollapse = (project: ProjectType) => {
  //   setIsOpen({ ...isOpen, [project]: !isOpen[project] })
  // }

  useEffect(() => {
    getStudent()
  }, [])

  // Client-side data fetching
  async function getStudent() {
    const response = await axios.post('/api/request-form/get', {
      netID: user.netID,
    })
    const [projects, requestsOfMultipleProjects] = await Promise.all([
      response.data.projects,
      response.data.requests,
    ])
    setProjects(projects)
    setProjectRequests(requestsOfMultipleProjects)
    setIsOpen(projects.map(() => true))
  }

  const toggleCollapse = (projectIndex: number) => {
    const newIsOpen = isOpen
    for (let i = 0; i < isOpen.length; i++) {
      if (i === projectIndex) {
        newIsOpen[i] = !newIsOpen[i]
      }
      setIsOpen(newIsOpen)
    }
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
      <h1>Welcome back {user && user.firstName}</h1>
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
              <div className='w-100'>
                {projectRequests[projIndex].length > 0 ? (
                  projectRequests[projIndex].map((request, reqIndex) => {
                    return (
                      // <h1 key={reqIndex}>Hi</h1>
                      <OrderCard
                        key={reqIndex}
                        orderNumber={request.requestID}
                        dateRequested={request.dateSubmitted}
                        orderSubTotal={request.RequestItem.reduce(
                          (total, item) =>
                            total + item.quantity * item.unitPrice,
                          0
                        )}
                        shippingCost={0}
                        orderTotal={request.RequestItem.reduce(
                          (total, item) =>
                            total + item.quantity * item.unitPrice,
                          0
                        )}
                        orderStatus={request.Process[0].status}
                      />
                    )
                  })
                ) : (
                  <p className='my-4'>There are no requests in this project.</p>
                )}
              </div>
            </Collapse>
          </Row>
        )
      })}
      {/* <Container>
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
      </Container> */}
    </>
  )
}
