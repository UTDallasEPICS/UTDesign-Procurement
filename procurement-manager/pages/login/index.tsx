import React, { MouseEvent, useRef, useState } from 'react'
import styles from '@/styles/Login.module.scss'
import { Dropdown, DropdownButton, Container, Row, Col } from 'react-bootstrap'
import axios from 'axios'
import { useRouter } from 'next/router'
import { User } from '@prisma/client'
// import index as Orders from '@/pages/orders/index'

export default function Login() {
  const [roleLoggedIn, setRoleLoggedIn] = useState('No user is logged in')
  const router = useRouter()

  async function handleSelect(e: MouseEvent) {
    e.preventDefault()

    // type safe
    if ('id' in e.target && typeof e.target.id === 'string') {
      const roleID: number = parseInt(e.target.id)

      try {
        console.log('roleID :: ', roleID)
        // POST request to our user API
        const response = await axios.post('/api/user/fakeauth', {
          roleID: roleID,
        })
        console.log('response :: ', response.data)
        if (response.status === 200) {
          const user: User = response.data.user
          console.log('user :: ', user)
          setRoleLoggedIn(`${user.firstName} is logged in`)

          // router.push('/orders')

          if (user.roleID === 2) {
            router.push('/orders/mentor')
          }
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
                <h2>{roleLoggedIn}</h2>
              </div>
            </Col>
          </Row>
        </Container>
      </main>
    </>
  )
}
