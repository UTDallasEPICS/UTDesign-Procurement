import React, { MouseEvent, useState } from 'react'
import styles from '@/styles/Login.module.scss'
import { Container, Row, Col, Form, Button } from 'react-bootstrap'
import { signIn } from 'next-auth/react'
import axios from 'axios'
import Image from 'next/image'

async function validateUser(email: string) {
  // HTTP POST request (to get updated data role ID based on request/param net ID)
  // used existing API from request form since it already has param net ID and returns role ID
  const response = await axios.post('/api/request-form/get', { email })
  return response // JSON object with role ID or error if user does not exist
}

export default function Login() {
  const [loginInput, setLoginInput] = useState('')
  const [error, setError] = useState('')

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    // Prevents the page from refreshing when submitting the form
    e.preventDefault()

    // Validate loginInput format (3 letters followed by 6 numbers)
    const loginFormat = /^[a-zA-Z]{3}\d{6}$/
    if (loginInput.match(loginFormat)) {
      try {
        // TODO: use an endpoint that takes netID or email interchangeably (different from request-form/get)
        const response = await validateUser(loginInput.toLowerCase() + '@utdallas.edu') // first make sure response is successful then get role ID
        const roleID: number = response.data.userRole
        const result = await signIn('credentials', {
          roleID: roleID,
          redirect: true,
          callbackUrl: '/orders',
        })
      } catch (error) {
        console.warn('Login error:', error)
        setError('Invalid NetID, user does not exist')
      }
    } else {
      setError('Invalid login format. Please enter a valid UTD NetID.')
    }
  }

  return (
    <>
      <main className={styles.main}>
        <Container className="h-100">
          <Row className="h-100">
            <Col>
              <div className={styles.wrapper}>
                <Form onSubmit={(e) => handleLogin(e)}>
                  <div className="text-center">
                    <Image
                      src="/images/utdLogo.png"
                      width={300}
                      height={200}
                      style={{ marginBottom: 30 }}
                      alt="UTD logo"
                    />
                  </div>

                  <Form.Group controlId="loginInput">
                    <Form.Control
                      type="text"
                      placeholder="Enter Your NetID"
                      value={loginInput}
                      onChange={(e) => {
                        setLoginInput(e.target.value)
                        setError('')
                      }}
                      maxLength={9}
                    />
                  </Form.Group>

                  {error && (
                    <p
                      style={{
                        color: 'red',
                        fontSize: 15,
                        position: 'absolute',
                      }}
                    >
                      <b>{error}</b>
                    </p>
                  )}

                  <Button
                    style={{
                      width: 300,
                      backgroundColor: 'darkgreen',
                      marginTop: 30,
                      borderColor: 'black',
                    }}
                    variant="primary"
                    type="submit"
                  >
                    Login
                  </Button>
                </Form>
              </div>
            </Col>
          </Row>
        </Container>
      </main>
    </>
  )
}
