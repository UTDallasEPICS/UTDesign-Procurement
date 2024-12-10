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
import AdminDeleteModal from '@/components/AdminDeleteModal'
import AdminDeactivateModal from '@/components/AdminDeactivateModal'
import AdminReactivateModal from '@/components/AdminReactivateModal'
import AdminSortByProjectModal from '@/components/AdminSortByProjectModal'

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
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDeactivateModal, setShowDeactivateModal] = useState(false);
  const [showReactivateModal, setShowReactivateModal] = useState(false);
  const [showSortByProjectModal, setShowSortByProjectModal] = useState(false);
  const [tableType, setTableType] = useState<string>('user');
  const [colData, setColData] = useState<any>([])
  const [defaultColDef, setDefaultColDef] = useState<any>({
    editable: true,
    filter: true,
    cellStyle: { textAlign: 'left' }
  })

  const handleAddUserClick = () => {
    setShowModal(true)
  }

  const handleAddProjectClick = () => {
    setShowModal(true)
  }

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
        { 
          field: 'roleID',
          valueFormatter: (params: any) => {
            const roleMap: { [key: number]: string } = {
              1: 'Admin',
              2: 'Mentor',
              3: 'Student'
            };
            return roleMap[params.value] || params.value;
          }
        },
        { 
          field: 'active',
          valueFormatter: (params: any) => params.value ? 'Active' : 'Inactive',
          cellRenderer: (params: any) => params.value ? 'Active' : 'Inactive',
          editable: false,
          type: 'textColumn',
          cellStyle: { textAlign: 'left' }
        },
        { field: 'responsibilities' },
        { 
          field: 'deactivationDate',
          valueFormatter: (params: any) => {
            if (!params.value) return '';
            return new Date(params.value).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            });
          }
        },
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
        { 
          field: 'activationDate',
          valueFormatter: (params: any) => {
            if (!params.value) return '';
            return new Date(params.value).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            });
          }
        },
        { 
          field: 'deactivationDate',
          valueFormatter: (params: any) => {
            if (!params.value) return '';
            return new Date(params.value).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            });
          }
        },
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

              <Button 
                variant="danger"
                className="mx-2"
                onClick={() => setShowDeleteModal(true)}
              >
                Delete
              </Button>
              <AdminDeleteModal
                show={showDeleteModal}
                onHide={() => setShowDeleteModal(false)}
                type={tableType}
              />
              <Button 
                variant="warning"
                className="mx-2"
                style={{ backgroundColor: '#98FB98', borderColor: '#98FB98', color: 'black' }}
                onClick={() => setShowReactivateModal(true)}
              >
                Reactivate
              </Button>
              <AdminReactivateModal
                show={showReactivateModal}
                onHide={() => setShowReactivateModal(false)}
                type={tableType}
              />
              <Button 
                variant="warning"
                className="mx-2"
                onClick={() => setShowDeactivateModal(true)}
              >
                Deactivate
              </Button>
              <AdminDeactivateModal
                show={showDeactivateModal}
                onHide={() => setShowDeactivateModal(false)}
                type={tableType}
              />
              <Button 
                variant="warning"
                className="mx-2"
                style={{ backgroundColor: '#9370DB', borderColor: '#9370DB', color: 'black' }}
                onClick={() => setShowSortByProjectModal(true)}
              >
                Sort by Project
              </Button>
              <AdminSortByProjectModal
                show={showSortByProjectModal}
                onHide={() => setShowSortByProjectModal(false)}
              />

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
              suppressRowDeselection={true}
            />
          </div>
        </Col>
      </Row>
    </>
  )
}
