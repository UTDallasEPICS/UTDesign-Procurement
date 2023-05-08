import React, { useEffect, useState } from 'react'
import { Container, Row, Col, Button, Collapse } from 'react-bootstrap'
import OrderCard from '../../components/StudentRequestCard'
import ProjectHeader from '../../components/ProjectHeader'
import { useSession } from 'next-auth/react'
import { Prisma, Project, User } from '@prisma/client'
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

  const toggleProjectCollapse = (projectIndex: number) => {
    setIsOpen((prevOpen) => {
      const newOpen = [...prevOpen]
      newOpen[projectIndex] = !newOpen[projectIndex]
      return newOpen
    })
  }

  return (
    <>
      <Row className='my-4'>
        <h1>Welcome back {user && user.firstName}</h1>
      </Row>
      {projects.map((project, projIndex) => {
        return (
          <Row className='big-row my-4' key={projIndex}>
            <ProjectHeader
              projectName={project.projectTitle}
              expenses={project.totalExpenses}
              available={Prisma.Decimal.sub(
                project.startingBudget,
                project.totalExpenses
              )}
              budgetTotal={project.startingBudget}
              onToggleCollapse={() => toggleProjectCollapse(projIndex)}
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
                            total + item.quantity * (item.unitPrice as any),
                          0
                        )}
                        shippingCost={0}
                        orderTotal={request.RequestItem.reduce(
                          (total, item) =>
                            total + item.quantity * (item.unitPrice as any),
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
