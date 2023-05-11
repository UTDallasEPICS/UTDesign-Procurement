/**
 * This file is the first page that the app redirects to and contains the fakeauth login page.
 */

import React, { MouseEvent } from 'react'
import styles from '@/styles/Login.module.scss'
import { Dropdown, DropdownButton, Container, Row, Col } from 'react-bootstrap'
import { signIn } from 'next-auth/react'
import axios from 'axios'

export default function Login() {
  async function handleSelect(e: MouseEvent) {
    e.preventDefault()

    // type safe
    if ('id' in e.target && typeof e.target.id === 'string') {
      const roleID: number = parseInt(e.target.id)

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
