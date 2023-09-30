/**
 * This file is the first page that the app redirects to and contains the fakeauth login page.
 */

import React, { MouseEvent } from 'react'
import styles from '@/styles/Login.module.scss'
import { Dropdown, DropdownButton, Container, Row, Col } from 'react-bootstrap'
import { signIn } from 'next-auth/react'
import axios from 'axios'

async function getRoleID(NetID: string)
{
  // HTTP POST request (to get updated data role ID based on request/param net ID)
  // used existing API from request form since it already has param net ID and returns role ID
  const response = await axios.post('/api/request-form/get', {
    netID: NetID,
  })
  const roleID: number = response.data.userRole;
  return roleID;
}

export default function Login() {
  async function handleSelect(e: MouseEvent) {
    e.preventDefault()

    // type safe
    if ('id' in e.target && typeof e.target.id === 'string') {
      const sampleNetID: string = "abc000000";
      const roleID: number = await getRoleID(sampleNetID);

      try {
        const result = await signIn('credentials', {
          roleID: roleID,
          redirect: true,
          callbackUrl: '/orders',
        })
      } catch (error) {
        // Error handling from https://bobbyhadz.com/blog/typescript-http-request-axios#making-http-post-requests-with-axios-in-typescript
        if (axios.isAxiosError(error)) {
          console.log('Axios error :: ', error.message)
          return error.message
        } else {
          console.log('Unexpected error :: ', error)
          return 'An unexpected error occurred'
        }
      }
    }
  }

  return (
    <>
      <main className={styles.main}>
        <Container className='h-100'>
          <Row className='h-100'>
            <Col>
              <div className={styles.wrapper}>
                <DropdownButton id='userDropdown' title='Select User'>
                  <Dropdown.Item onClick={handleSelect} id='1'>
                    Admin
                  </Dropdown.Item>
                  <Dropdown.Item onClick={handleSelect} id='2'>
                    Mentor
                  </Dropdown.Item>
                  <Dropdown.Item onClick={handleSelect} id='3'>
                    Student
                  </Dropdown.Item>
                </DropdownButton>
              </div>
            </Col>
          </Row>
        </Container>
      </main>
    </>
  )
}
