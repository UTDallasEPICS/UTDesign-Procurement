/**
 * This is the Admin View for the Database Updates Page
 */

import React, { useEffect, useState } from 'react'
import { Button, Col, Row } from 'react-bootstrap'
import { prisma } from '@/db'
import { Project, Request, User } from '@prisma/client'
import CustomTable from '@/components/Table'
import Link from 'next/link'
import Head from 'next/head'
import styles from '@/styles/DatabaseUpdate.module.scss'
import { AgGridReact } from 'ag-grid-react'
import 'ag-grid-community/styles/ag-grid.css' // Core CSS
import 'ag-grid-community/styles/ag-theme-quartz.css' // Theme

export async function getServerSideProps() {
  const users = await prisma.user.findMany()
  const projects = await prisma.project.findMany()
  const requests = await prisma.request.findMany()

  return {
    props: {
      title: 'Database Updates - Procurement Manager',
      description: 'University of Texas at Dallas',
      users: JSON.parse(JSON.stringify(users)),
      projects: JSON.parse(JSON.stringify(projects)),
      requests: JSON.parse(JSON.stringify(requests)),
    },
  }
}

interface AdminProps {
  title: String
  description: String
  users: User[]
  projects: Project[]
  requests: Request[]
}

type AgGridColumn = {
  headerName: string
  field: string
}

export default function admin({
  title,
  description,
  users,
  projects,
  requests,
}: AdminProps): JSX.Element {
  const [tableType, setTableType] = useState<string>('user') // either user or project
  const [colData, setColData] = useState<any>([])
  const [defaultColDef, setDefaultColDef] = useState<any>({
    editable: true,
    filter: true,
  })

  useEffect(() => {
    if (tableType === 'user') {
      console.log(users)
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
      console.log(projects)
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
            <div>
              <Button onClick={() => setTableType('user')}>Users</Button>
              <Button onClick={() => setTableType('project')} className='mx-2'>
                Projects
              </Button>
            </div>

            {/* Upload Button */}
            <Link href={'/database-updates/upload'}>
              <Button>Upload Files</Button>
            </Link>
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
              />
            ) : (
              <AgGridReact
                rowData={projects}
                columnDefs={colData}
                defaultColDef={defaultColDef}
                autoSizeStrategy={{ type: 'fitCellContents' }}
                pagination={true}
              />
            )}
          </div>
          {/* <CustomTable
            type={tableType}
            data={tableType == 'user' ? users : projects}
          ></CustomTable> */}
        </Col>
      </Row>
    </>
  )
}
