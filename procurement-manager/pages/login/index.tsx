import React, { MouseEvent, useRef, useState } from 'react'
import styles from '@/styles/Login.module.scss'
import { Dropdown, DropdownButton, Container, Row, Col } from 'react-bootstrap'
import axios from 'axios'
import { useRouter } from 'next/router'

export default function Login() {
  const [roleLoggedIn, setRoleLoggedIn] = useState('No user is logged in')
  const router = useRouter()

  async function handleSelect(e: MouseEvent) {
    e.preventDefault()

    // type safe
    if ('id' in e.target && typeof e.target.id === 'string') {
      const role: string = e.target.id

      try {
        // POST request to our user API
        const { data, status } = await axios.post('/api/user', {
          role: role,
        })
        console.log('response status: ', status)
        console.log('response data: ', data)
        setRoleLoggedIn(`${data.givenRole} is logged in`)

        if (role === 'mentor') {
          router.push('/orders/mentor')
        }
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
                  <Dropdown.Item onClick={handleSelect} id='admin'>
                    Admin
                  </Dropdown.Item>
                  <Dropdown.Item onClick={handleSelect} id='mentor'>
                    Mentor
                  </Dropdown.Item>
                  <Dropdown.Item onClick={handleSelect} id='student'>
                    Student
                  </Dropdown.Item>
                </DropdownButton>
                <h2>{roleLoggedIn}</h2>
              </div>
            </Col>
          </Row>
        </Container>
      </main>
    </>
  )
}
