/**
 * This is the Student view in the Orders Page
 */

import React, { useEffect, useState } from 'react'
import { Row } from 'react-bootstrap'
import OrderCard from '../../components/StudentRequestCard'
import ProjectHeader from '../../components/ProjectHeader'
import { Prisma, Project, User } from '@prisma/client'
import { RequestDetails } from '@/lib/types'
import axios from 'axios'
import { Session, getServerSession } from 'next-auth'
import { authOptions } from '../api/auth/[...nextauth]'

export async function getServerSideProps(context: any) {
  const session = await getServerSession(context.req, context.res, authOptions)
  const user = session?.user as User
  return {
    props: {
      session: session,
      user: user,
    },
  }
}

interface StudentProps {
  session: Session | null
  user: User
}

export default function Student({ session, user }: StudentProps) {
  // state for opening the collapsed cards - an array due to multiple projects
  const [isOpen, setIsOpen] = useState<boolean[]>([])
  // state for the requests inside the different projects associated to the user
  const [projectRequests, setProjectRequests] = useState<RequestDetails[][]>([])
  // state for the projects associated to the user
  const [projects, setProjects] = useState<Project[]>([])

  useEffect(() => {
    getStudent()
  }, [])

  // Client-side data fetching whenever we need to refetch the data and rerender the page but can be done in getServerSideProps
  /**
   * This function is called when the page needs to be rerendered with the updated data
   * This function calls our api that gets all projects associated to the user and their requests
   */
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

  /**
   * This was a feature where clicking the hide/show button in ProjectHeader
   * would instead hide all the requests for the project.
   * @param projectIndex - The index of the project in the projects array.
   */
  const toggleProjectCollapse = (projectIndex: number) => {
    setIsOpen((prevOpen) => {
      const newOpen = [...prevOpen]
      newOpen[projectIndex] = !newOpen[projectIndex]
      return newOpen
    })
  }

  /**
   * This is the feature where clicking the hide/show button in ProjectHeader
   * would show the details of each request in the project
   * @param projectIndex - The index of the project in the projects array.
   */
  const toggleCards = (projectIndex: number) => {
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
              onToggleCollapse={() => toggleCards(projIndex)}
              isOpen={isOpen[projIndex]}
            />
            {/* <Collapse in={isOpen[projIndex]}>
              <div className='w-100'> */}
            {projectRequests[projIndex].length > 0 ? (
              projectRequests[projIndex].map((request, reqIndex) => {
                return (
                  <OrderCard
                    key={reqIndex}
                    details={request}
                    collapsed={isOpen[projIndex]}
                  />
                )
              })
            ) : (
              <p className='my-4'>There are no requests in this project.</p>
            )}
            {/* </div>
            </Collapse> */}
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
