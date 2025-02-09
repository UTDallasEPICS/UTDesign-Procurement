/**
 * This file is the NavBar component for the application.
 */

import { Navbar, Offcanvas, Nav, Button } from 'react-bootstrap'
import styles from '@/styles/Navbar.module.scss'
import { signIn, signOut, useSession } from 'next-auth/react'
import { User } from '@prisma/client'
import Link from 'next/link'

interface NavbarProps {}

export default function NavBar({}: NavbarProps): JSX.Element {
  const { data: session } = useSession()
  const user = session?.user as User
  return (
    <>
      <Navbar expand={'lg'} variant='dark' className={`${styles.navbar} mb-3`}>
        <Navbar.Brand href='#' className='mx-4'>
          UTDesign Procurement Manager
        </Navbar.Brand>
        <Navbar.Toggle aria-controls={`offcanvasNavbar-expand-lg`} />
        <Navbar.Offcanvas
          id={`offcanvasNavbar-expand-lg`}
          aria-labelledby={`offcanvasNavbarLabel-expand-lg`}
          placement='end'
        >
          <Offcanvas.Header closeButton>
            <Offcanvas.Title id={`offcanvasNavbarLabel-expand-lg`}>
              UTDesign Procurement Manager
            </Offcanvas.Title>
          </Offcanvas.Header>
          <Offcanvas.Body className='mx-4'>
            <Nav className='justify-content-end flex-grow-1'>
              {user ? (
                <>
                  {/* Links everyone can see */}
                  <Nav.Link as={Link} href='/orders' className='mx-2'>
                    Orders
                  </Nav.Link>

                  {/* Links seen by Admin */}
                  {user.roleID === 1 && (
                    <>
                      <Nav.Link as={Link} href='/projects' className='mx-2'>
                        {' '}
                        {/* for now only admin can use projects/order history page */}
                        Projects & Order History
                      </Nav.Link>
                      <Nav.Link as={Link} href='/database-updates' className='mx-2'>
                        Database Updates
                      </Nav.Link>
                    </>
                  )}

                  {/* Links seen by Student */}
                  {user.roleID === 3 && (
                    <>
                      <Nav.Link as={Link} href='/request-form' className='mx-2'>
                        Request Form
                      </Nav.Link>
                      <Nav.Link as={Link} href='/reimbursement' className='mx-2'>
                        Reimbursement Form
                      </Nav.Link>
                    </>
                  )}

                  <Button
                    variant='secondary'
                    onClick={() => signOut({ callbackUrl: '/' })}
                  >
                    Log Out
                  </Button>
                </>
              ) : (
                <>
                  <Button variant='secondary' onClick={() => signIn()}>
                    Log In
                  </Button>
                </>
              )}
            </Nav>
          </Offcanvas.Body>
        </Navbar.Offcanvas>
      </Navbar>
    </>
  )
}
