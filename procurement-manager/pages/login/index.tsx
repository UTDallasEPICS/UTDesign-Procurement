/**
 * This file is the first page that the app redirects to and contains the fakeauth login page.
 */

import React, { MouseEvent, useState } from 'react';
import styles from '@/styles/Login.module.scss';
import { Container, Row, Col, Form, Button } from 'react-bootstrap';
import { signIn } from 'next-auth/react';
import axios from 'axios';

async function validateUser(NetID: string)
{
  // HTTP POST request (to get updated data role ID based on request/param net ID)
  // used existing API from request form since it already has param net ID and returns role ID
  const response = await axios.post('/api/request-form/get', {
    netID: NetID,
  })
  return response; // JSON object with data like role ID
}

export default function Login() {
  const [loginInput, setLoginInput] = useState('');

  async function handleLogin() {
    // Validate loginInput format (3 letters followed by 6 numbers)
    const loginFormat = /^[a-zA-Z]{3}\d{6}$/;
    if (loginInput.match(loginFormat)) {
      try {
        const response = await validateUser(loginInput);
        const roleID: number = response.data.userRole;
        const result = await signIn('credentials', {
          roleID: roleID,
          redirect: true,
          callbackUrl: '/orders',
        });
      } catch (error) {
        // Error handling logic
        console.error('Error:', error);
      }
    } else {
      console.error('Invalid login format. Please enter a valid UTD NetID.');
    }
  }

  return (
    <>
      <main className={styles.main}>
        <Container className='h-100'>
          <Row className='h-100'>
            <Col>
              <div className={styles.wrapper}>
                <Form>
                  <Form.Group controlId='loginInput'>
                    <Form.Control
                      type='text'
                      placeholder='Enter Your NetID'
                      value={loginInput}
                      onChange={(e) => setLoginInput(e.target.value)}
                      maxLength={9}
                    />
                  </Form.Group>
                  <Button
                    style={{width:210, backgroundColor: "dark green", marginTop:20, borderColor: "dark green"}}
                    variant='primary' onClick={handleLogin}>
                    Login
                  </Button>
                </Form>
              </div>
            </Col>
          </Row>
        </Container>
      </main>
    </>
  );
}
