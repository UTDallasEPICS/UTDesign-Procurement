/**
 * This is the Admin View for the Database Updates Page
 */

import React, { useState } from 'react'
import { Button, Col, Row } from 'react-bootstrap'
import { prisma } from '@/db'
import { Project, Request, User } from '@prisma/client'
import CustomTable from '@/components/Table'
import Link from 'next/link'
import Head from 'next/head'
import styles from '@/styles/DatabaseUpdate.module.scss'

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

export default function admin({
  title,
  description,
  users,
  projects,
  requests,
}: AdminProps): JSX.Element {
  const [tableType, setTableType] = useState<string>('user') // either user or project

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name='description' content={description.toString()} />
      </Head>
      <Row>
        {/* Users Dropdown (maybe, hopefully) & Projects Button*/}
        <Col xs={3}>
          <div className={styles['header-btns-container']}>
            <Button onClick={() => setTableType('user')} className='mr-2'>
              Users
            </Button>
            <Button onClick={() => setTableType('project')}>Projects</Button>
          </div>
        </Col>

        {/* Upload Button */}
        <Col xs={9} className={styles['upload-btn-container']}>
          <Link href={'/database-updates/upload'}>
            <Button>Upload Files</Button>
          </Link>
        </Col>
      </Row>

      {/* Tables Component */}
      <Row>
        <Col>
          <CustomTable
            type={tableType}
            data={tableType == 'user' ? users : projects}
          ></CustomTable>
        </Col>
      </Row>
    </>
  )
}
