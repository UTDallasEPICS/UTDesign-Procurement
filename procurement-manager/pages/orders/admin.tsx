import React, { useContext, useEffect, useState } from 'react'
import { Container, Row, Collapse } from 'react-bootstrap'
import TopBarComponent from '@/components/TopBarComponent'
import AdminRequestCard from '@/components/AdminRequestCard'
import ProjectHeader from '@/components/ProjectHeader'
import ReimbursementCard from '@/components/AdminReimbursementCard'
import { prisma } from '@/db'
import { RequestDetails } from '@/lib/types'
import { Project, Status, User } from '@prisma/client'
import { Request } from '@prisma/client'
import { Decimal } from '@prisma/client/runtime'
import { useSession } from 'next-auth/react'

export async function getServerSideProps() {
  const projects = await prisma.project.findMany()
  const requestOfMultipleProjects: RequestDetails[][] = []

  for (const project of projects) {
    const requests = await prisma.request.findMany({
      where: {
        projectID: project.projectID,
        Process: {
          some: {
            status: Status.APPROVED,
          },
        },
      },
      include: {
        RequestItem: true,
        Process: true,
        OtherExpense: true,
        project: true,
      },
    })
    requestOfMultipleProjects.push(requests)
  }

  console.log(projects)

  return {
    // needed to stringify the object first to avoid non-serializable error
    props: {
      requests: JSON.parse(JSON.stringify(requestOfMultipleProjects)),
      projects: JSON.parse(JSON.stringify(projects)),
    },
  }
}

interface AdminProps {
  requests: RequestDetails[][]
  projects: Project[]
}

export default function Admin({ requests, projects }: AdminProps): JSX.Element {
  // const [isOpenProject1, setIsOpenProject1] = useState(true)
  // const [isOpenProject2, setIsOpenProject2] = useState(true)
  const { data: session } = useSession()
  const user = session?.user as User
  const [isOpen, setIsOpen] = useState<boolean[]>([])

  useEffect(() => {
    setIsOpen(projects.map(() => true))
  }, [])

  // function findAvailableBudget(startingBudget: Decimal, expenses: Decimal) {
  //   return startingBudget.toNumber() - expenses.toNumber()
  // }

  // const toggleCollapseProject1 = () => {
  //   setIsOpenProject1(!isOpenProject1)
  // }

  // const toggleCollapseProject2 = () => {
  //   setIsOpenProject2(!isOpenProject2)
  // }

  function toggleCollapse(projectIndex: number) {
    const newIsOpen = isOpen
    for (let i = 0; i < isOpen.length; i++) {
      if (i === projectIndex) {
        newIsOpen[i] = !newIsOpen[i]
      }
    }
    setIsOpen(newIsOpen)
  }

  return (
    <>
      <h1>Welcome back {user && user.firstName}</h1>
      {/* Creates the ProjectHeader  */}
      {projects.map((project, projIndex) => {
        return (
          <Row key={projIndex}>
            <ProjectHeader
              projectName={project.projectTitle}
              expenses={project.totalExpenses}
              available={project.startingBudget - project.totalExpenses}
              // available={(project.startingBudget as number) - project.totalExpenses}
              budgetTotal={project.startingBudget}
              onToggleCollapse={() => {
                toggleCollapse(projIndex)
              }}
              isOpen={isOpen[projIndex]}
            />
            {/* Details of the request forms modeled into cards */}
            {/* These are the request forms associated to its project */}
            <Collapse in={isOpen[projIndex]}>
              <div>
                {requests[projIndex].length > 0 ? (
                  requests[projIndex].map((request, reqIndex) => {
                    return (
                      <AdminRequestCard
                        key={reqIndex}
                        details={request}
                        onReject={function (): void {
                          throw new Error('Function not implemented.')
                        }}
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
      {/* <Row>
        <ProjectHeader
          title='Project 1: Project Name | Capstone, Request'
          budget='Budget: $100/$500'
          isOpen={isOpenProject1}
          toggleCollapse={toggleCollapseProject1}
        />
        <Collapse in={isOpenProject1}>
          <div>
            <Row>
              <AdminRequestCard
                requestNumber={0}
                dateRequested={undefined}
                dateNeeded={undefined}
                orderTotal={0}
                status={'UNDER_REVIEW'}
                onReject={function (): void {
                  throw new Error('Function not implemented.')
                }}
              />
              <AdminRequestCard
                requestNumber={0}
                dateRequested={undefined}
                dateNeeded={undefined}
                orderTotal={0}
                status={'UNDER_REVIEW'}
                onReject={function (): void {
                  throw new Error('Function not implemented.')
                }}
              />
            </Row>
          </div>
        </Collapse>
      </Row>
      <Row>
        <ProjectHeader
          projectName='Project 3: Point of Nerve Conduction Diagnostic | Capstone, Reimbursement'
          // budget='Budget: $100/$500'
          isOpen={isOpenProject2}
          expenses={0}
          available={0}
          budgetTotal={new Decimal()}
          onToggleCollapse={function (): void {
            throw new Error('Function not implemented.')
          }} // toggleCollapse={toggleCollapseProject2}
        />
        <Collapse in={isOpenProject2}>
          <div>
            <Row>
              <ReimbursementCard />
              <ReimbursementCard />
            </Row>
          </div>
        </Collapse>
      </Row> */}
      {/* </Container> */}
    </>
  )
}
