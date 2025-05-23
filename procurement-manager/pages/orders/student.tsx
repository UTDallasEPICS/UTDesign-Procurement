/**
 * This is the Student view in the Orders Page
 */

import React, { useEffect, useState } from 'react'
import { Row } from 'react-bootstrap'
import RequestCard from '../../components/StudentRequestCard'
import ReimburseCard from '../../components/StudentReimbursementCard'
import ProjectHeader from '../../components/ProjectHeader'
import { Prisma, Project, User } from '@prisma/client'
import { ReimbursementDetails, RequestDetails } from '@/lib/types'
import axios from 'axios'
import { Session, getServerSession } from 'next-auth'
import { authOptions } from '../api/auth/[...nextauth]'
import { GetServerSideProps } from 'next'

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getServerSession(context.req, context.res, authOptions)

  if (!session || !session.user) {
    return {
      redirect: {
        destination: '/login',
        permanent: false,
      },
    }
  }

  const user = session.user as User

  // Only allow access if the user is a student
  if (user.roleID !== 3) {
    return {
      redirect: {
        destination: '/unauthorized',
        permanent: false,
      },
    }
  }

  return {
    props: {
      session,
      user,
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
  const [projectReimbursements, setProjectReimbursements] = useState<ReimbursementDetails[][]>([])

  // state for the projects associated to the user
  const [projects, setProjects] = useState<Project[]>([])

  useEffect(() => {
    getStudentReimbursements()
    getStudentRequests()
    console.log("TEST")
  }, [])

  // Client-side data fetching whenever we need to refetch the data and rerender the page but can be done in getServerSideProps
  /**
   * This function is called when the page needs to be rerendered with the updated data
   * This function calls our api that gets all projects associated to the user and their requests
   */
  async function getStudentRequests() {
    const response = await axios.post('/api/request-form/get', {
      email: user.email,
    })
    const [projects, requestsOfMultipleProjects] = await Promise.all([
      response.data.projects,
      response.data.requests,
    ])
    setProjects(projects)
    setProjectRequests(requestsOfMultipleProjects)
    setIsOpen(projects.map(() => true))
  }

  async function getStudentReimbursements() {
    const nextResponse = await axios.post('/api/reimbursement-form/get', {
      email: user.email,
    })
    const [reimbursementsOfMultipleProjects] = await Promise.all([
      nextResponse.data.reimbursements
    ])
    setProjectReimbursements(reimbursementsOfMultipleProjects)
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
              available={(
                project.startingBudget -
                project.totalExpenses
              )}
              budgetTotal={project.startingBudget}
              onToggleCollapse={() => toggleCards(projIndex)}
              isOpen={isOpen[projIndex]}
            />
                          
            {
            projectRequests[projIndex]?.length > 0 ? (
              projectRequests[projIndex].map((request, reqIndex) => {
                return (
                  <RequestCard
                    key={reqIndex}
                    details={request}
                    collapsed={isOpen[projIndex]}
                  />
                )
              })
            ) : (
              <p className='my-4'>There are no procurement requests in this project.</p>
            )} 

            {
            projectReimbursements[projIndex]?.length > 0 ? (
              projectReimbursements[projIndex].map((reimbursement, reimIndex) => {
                return (
                  <ReimburseCard
                    key={reimIndex}
                    details={reimbursement}
                    collapsed={isOpen[projIndex]}
                  />
                )
              })
            ) : (
              <p className='my-4'>There are no reimbursement requests in this project.</p>
            )}
          </Row>
        )
      })}
    </>
  )
}
