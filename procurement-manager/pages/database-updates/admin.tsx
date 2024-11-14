/**
 * This is the Admin View for the Database Updates Page
 */


import React, { useEffect, useState } from 'react'
import { Button, Col, Nav, Row } from 'react-bootstrap'
import { prisma } from '@/db'
import { Project, User } from '@prisma/client'
import Link from 'next/link'
import Head from 'next/head'
import styles from '@/styles/DatabaseUpdate.module.scss'
import { AgGridReact } from 'ag-grid-react'
import 'ag-grid-community/styles/ag-grid.css'
import 'ag-grid-community/styles/ag-theme-quartz.css'
import { CellValueChangedEvent } from 'ag-grid-community'
import AdminAddButtonModal from '@/components/AdminAddButtonModal'

export async function getServerSideProps() {
  const users = await prisma.user.findMany()
  const projects = await prisma.project.findMany()

  return {
    props: {
      title: 'Database Updates - Procurement Manager',
      description: 'University of Texas at Dallas',
      users: JSON.parse(JSON.stringify(users)),
      projects: JSON.parse(JSON.stringify(projects)),
    },
  }
}

interface AdminProps {
  title: String
  description: String
  users: User[]
  projects: Project[]
}

export default function admin({
  title,
  description,
  users,
  projects,
}: AdminProps): JSX.Element {
  const [tableType, setTableType] = useState<string>('user') // either user or project
  const [colData, setColData] = useState<any>([])
  const [showModal, setShowModal] = useState(false)

  const handleAddUserClick = () => {
    setShowModal(true)
  }

  const handleAddProjectClick = () => {
    setShowModal(true)
  }

  const [defaultColDef, setDefaultColDef] = useState<any>({
    editable: true,
    filter: true,
  })

  const onCellValueChanged = (event: CellValueChangedEvent) => {
    if (event.rowIndex === null) return
  }

  useEffect(() => {
    if (tableType === 'user') {
      setColData([
        { field: 'userID' },
        { field: 'netID' },
        { field: 'firstName' },
        { field: 'lastName' },
        { field: 'email' },
        { field: 'roleID' },
        { field: 'active' },
        { field: 'responsibilities' },
        { field: 'deactivationDate' },
      ])
    } else if (tableType === 'project') {
      setColData([
        { field: 'projectID' },
        { field: 'projectTitle' },
        { field: 'projectNum' },
        { field: 'startingBudget' },
        { field: 'totalExpenses' },
        { field: 'projectType' },
        { field: 'sponsorCompany' },
        { field: 'activationDate' },
        { field: 'deactivationDate' },
        { field: 'additionalInfo' },
        { field: 'costCenter' },
      ])
    }
  }, [tableType])

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name='description' content={description.toString()} />
      </Head>
      <Row>
        <Col>
          <div className={styles['header-btns-container']}>
            <Nav variant='tabs' defaultActiveKey={'user'} className='flex-grow-1 me-4'>
              <Nav.Item>
                <Nav.Link eventKey={'user'} onClick={() => setTableType('user')}>
                  Users
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey={'project'} onClick={() => setTableType('project')}>
                  Projects
                </Nav.Link>
              </Nav.Item>
            </Nav>

            <div>
              <Button variant="success" onClick={() => setShowModal(true)}>Add</Button>
              <AdminAddButtonModal
                show={showModal}
                onHide={() => setShowModal(false)}
              />

              <Button variant="danger" className="mx-2">Delete</Button>
              <Link href={'/database-updates/upload'}>
                <Button>Upload Files</Button>
              </Link>
            </div>
          </div>
        </Col>
      </Row>

      <Row>
        <Col>
          <div className='ag-theme-quartz' style={{ width: '100%', height: '75vh' }}>
            <AgGridReact
              rowData={tableType === 'user' ? users : projects}
              columnDefs={colData}
              defaultColDef={defaultColDef}
              autoSizeStrategy={{ type: 'fitCellContents' }}
              pagination={true}
              onCellValueChanged={onCellValueChanged}
              stopEditingWhenCellsLoseFocus={true}
            />
          </div>
        </Col>
      </Row>
    </>
  )
}
