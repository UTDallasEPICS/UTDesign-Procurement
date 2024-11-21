/**
 * This is the Admin View for the Database Updates Page
 */

import React, { useEffect, useState } from 'react'
import { Button, Col, Nav, Row } from 'react-bootstrap'
import { prisma } from '@/db'
import { Project, Request, User, Vendor } from '@prisma/client'
import Link from 'next/link'
import Head from 'next/head'
import styles from '@/styles/DatabaseUpdate.module.scss'
import { AgGridReact } from 'ag-grid-react'
import 'ag-grid-community/styles/ag-grid.css' // Core CSS
import 'ag-grid-community/styles/ag-theme-quartz.css' // Theme
import { CellValueChangedEvent } from 'ag-grid-community'

export async function getServerSideProps() {
  const users = await prisma.user.findMany()
  const projects = await prisma.project.findMany()
  const vendors = await prisma.vendor.findMany()
  // const requests = await prisma.request.findMany()

  return {
    props: {
      title: 'Database Updates - Procurement Manager',
      description: 'University of Texas at Dallas',
      users: JSON.parse(JSON.stringify(users)),
      projects: JSON.parse(JSON.stringify(projects)),
      vendors: JSON.parse(JSON.stringify(vendors)),
      // requests: JSON.parse(JSON.stringify(requests)),
    },
  }
}

interface AdminProps {
  title: String
  description: String
  users: User[]
  projects: Project[]
  vendors: Vendor[]
  // requests: Request[]
}

export default function admin({
  title,
  description,
  users,
  projects,
  vendors,
  // requests,
}: AdminProps): JSX.Element {
  const [tableType, setTableType] = useState<string>('user') // either user or project
  const [colData, setColData] = useState<any>([])
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
    } else if (tableType === 'vendor') {
      setColData([
        { field: 'vendorID' },
        { field: 'vendorName' },
        {
          field: 'vendorStatus',
          cellRenderer: (params: any) => {
            const currentStatus = params.value;
        
            // Function to handle dropdown change
            const handleDropdownChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
              const newStatus = e.target.value;
        
              // Update the local data immediately for UI responsiveness
              params.data.vendorStatus = newStatus;
              params.api.refreshCells({ rowNodes: [params.node], force: true });
        
              // Make an API call to update the database
              try {
                const response = await fetch('/api/vendor/updateStatus', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({
                    vendorID: params.data.vendorID,
                    newStatus,
                  }),
                });
        
                if (!response.ok) {
                  console.error('Failed to update vendor status in the database.');
                  // Optionally, revert UI changes if the API call fails
                  params.data.vendorStatus = currentStatus;
                  params.api.refreshCells({ rowNodes: [params.node], force: true });
                }
              } catch (error) {
                console.error('Error updating vendor status:', error);
                // Revert UI changes in case of an error
                params.data.vendorStatus = currentStatus;
                params.api.refreshCells({ rowNodes: [params.node], force: true });
              }
            };
        
            return (
              <select
                value={currentStatus}
                onChange={handleDropdownChange}
                style={{
                  padding: '5px',
                  borderRadius: '5px',
                  backgroundColor: currentStatus === 'APPROVED' ? 'green' : 'red',
                  color: 'white',
                  border: 'none',
                }}
              >
                <option value="APPROVED">APPROVED</option>
                <option value="DENIED">DENIED</option>
              </select>
            );
          },
        },
        { field: 'vendorEmail' },
        { field: 'vendorURL' },
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
              <Nav.Item>
                <Nav.Link
                  eventKey={'vendor'}
                  onClick={() => setTableType('vendor')}
                >
                  Vendors
                </Nav.Link>
              </Nav.Item>
            </Nav>

            <div>
              {/* TODO: Finish add and delete functionality for Admins */}
              <Button variant='success'>Add</Button>
              <Button variant='danger' className='mx-2'>
                Delete
              </Button>
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
            ) : tableType === 'project' ? (
              <AgGridReact
                rowData={projects}
                columnDefs={colData}
                defaultColDef={defaultColDef}
                autoSizeStrategy={{ type: 'fitCellContents' }}
                pagination={true}
                onCellValueChanged={onCellValueChanged}
                stopEditingWhenCellsLoseFocus={true}
              />
            ) : (
              <AgGridReact
                rowData={vendors}
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
