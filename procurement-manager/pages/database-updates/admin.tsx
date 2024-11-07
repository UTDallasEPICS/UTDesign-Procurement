/**
 * This is the Admin View for the Database Updates Page
 */

import React, { useEffect, useState } from 'react'
import { Button, Col, Modal, Nav, Row, Form} from 'react-bootstrap'
import { prisma } from '@/db'
import { Project, Request, User } from '@prisma/client'
import Link from 'next/link'
import Head from 'next/head'
import styles from '@/styles/DatabaseUpdate.module.scss'
import { AgGridReact } from 'ag-grid-react'
import 'ag-grid-community/styles/ag-grid.css' // Core CSS
import 'ag-grid-community/styles/ag-theme-quartz.css' // Theme
import { CellValueChangedEvent } from 'ag-grid-community'
import AddOptionModal from '@/components/AdminAddButtonModal';


export async function getServerSideProps() {
  const users = await prisma.user.findMany()
  const projects = await prisma.project.findMany()
  // const requests = await prisma.request.findMany()

  return {
    props: {
      title: 'Database Updates - Procurement Manager',
      description: 'University of Texas at Dallas',
      users: JSON.parse(JSON.stringify(users)),
      projects: JSON.parse(JSON.stringify(projects)),
      // requests: JSON.parse(JSON.stringify(requests)),
    },
  }
}

interface AdminProps {
  title: String
  description: String
  users: User[]
  projects: Project[]
  // requests: Request[]
}

export default function admin({
  title,
  description,
  users,
  projects,
  // requests,
}: AdminProps): JSX.Element {
  const [tableType, setTableType] = useState<string>('user') // either user or project
  const [colData, setColData] = useState<any>([])
  const [showModal, setShowModal] = useState(false);
  const [showRejectionReason, setShowRejectionReason] = useState(false);
  const handleAddUserClick = () => {
    setShowRejectionReason(true);
  };

  const [defaultColDef, setDefaultColDef] = useState<any>({
    editable: true,
    filter: true,
  })

  
  const onCellValueChanged = (
    event: CellValueChangedEvent
  ) => {
    if (event.rowIndex === null) return
    // TODO edit database values
    // users[event.rowIndex].lastName = event.newValue
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
            {/* Users Dropdown (maybe, hopefully) & Projects Button*/}
            <Nav
              variant='tabs'
              defaultActiveKey={'user'}
              className='flex-grow-1 me-4'
            >
              <Nav.Item>
                <Nav.Link
                  eventKey={'user'}
                  onClick={() => setTableType('user')}
                >
                  Users
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link
                  eventKey={'project'}
                  onClick={() => setTableType('project')}
                >
                  Projects
                </Nav.Link>
              </Nav.Item>
            </Nav>

            <div>
              {/* TODO: Finish add and delete functionality for Admins */}
              <Button variant="success" onClick={() => setShowModal(true)}>Add</Button>  
                <Modal show={showModal} onHide={() => setShowModal(false)}>
                  <Modal.Header closeButton>
                    <Modal.Title>Select Add Option</Modal.Title>
                  </Modal.Header>
                  <Modal.Body>
                    <p>What would you like to add?</p>
                    {<Button variant="secondary" className="mx-2" onClick={handleAddUserClick}>Add User</Button>}
                    {showRejectionReason && (
                    <Form>
                      <Form.Group controlId="rejectionReason">
                        <Form.Label>Reason for rejection:</Form.Label>
                        <Form.Control as="textarea" rows={1} />
                      </Form.Group>
                    </Form>
                    )}
                    {<Button variant="primary">Add Project</Button>}
                  </Modal.Body>
                </Modal> 
              
              <Button variant="danger" className="mx-2">Delete</Button>           
              
              {/* Upload Button */}
              <Link href={'/database-updates/upload'}>
                <Button>Upload Files</Button>
              </Link>
            </div>
          </div>
        </Col>
      </Row>

      {/* Tables Component */}
      <Row>
        <Col>
          <div
            className='ag-theme-quartz'
            style={{
              width: '100%',
              height: '75vh',
            }}
          >
            {tableType === 'user' ? (
              <AgGridReact
                rowData={users}
                columnDefs={colData}
                defaultColDef={defaultColDef}
                autoSizeStrategy={{ type: 'fitCellContents' }}
                pagination={true}
                onCellValueChanged={onCellValueChanged}
                stopEditingWhenCellsLoseFocus={true}
              />
            ) : (
              <AgGridReact
                rowData={projects}
                columnDefs={colData}
                defaultColDef={defaultColDef}
                autoSizeStrategy={{ type: 'fitCellContents' }}
                pagination={true}
                onCellValueChanged={onCellValueChanged}
                stopEditingWhenCellsLoseFocus={true}
              />
            )}
          </div>
        </Col>
      </Row>
      
    </>
  )
}

