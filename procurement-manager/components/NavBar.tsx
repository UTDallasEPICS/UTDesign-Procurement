import React, { useContext } from 'react'
import Link from 'next/link'
import { Navbar, Container, Offcanvas, Nav, Button } from 'react-bootstrap'
import styles from '@/styles/Navbar.module.scss'
import { UserContext } from '@/pages/_app'

interface NavbarProps {}

export default function NavBar({}: NavbarProps): JSX.Element {
  const userContext = useContext(UserContext)
  return (
    <>
      {/* <Navbar expand={'lg'} bg='dark' className={`${styles.navbar} mb-3`}>
        <Container>
          <Navbar.Brand href='#'>UTDesign Procurement Manager</Navbar.Brand>
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
            <Offcanvas.Body>
              <Nav className='justify-content-end flex-grow-1'>
                <Nav.Link href='/orders'>Orders</Nav.Link>
                <Nav.Link href='/order-history'>Order History</Nav.Link>
                <Nav.Link href='/project-updates'>Project Updates</Nav.Link>
                <Button
                  variant='outline-secondary'
                  href='/login'
                  onClick={() => {
                    if (userContext?.loggedIn) {
                      userContext?.setLoggedIn(false)
                    }
                  }}
                >
                  {userContext?.loggedIn ? 'Log Out' : 'Log In'}
                </Button>
              </Nav>
            </Offcanvas.Body>
          </Navbar.Offcanvas>
        </Container>
      </Navbar> */}
      <div className={styles.topBar}>
        <div className={styles.headerSection}>
          <Container className={styles.headerSection}>
            <h4>UTD Procurement Manager</h4>
            <Link href='/login'>
              <span className={styles.logout}>Log Out</span>
            </Link>
          </Container>
        </div>
        <div className={styles.menuSection}>
          <nav className={styles.navigation}>
            <a className={styles.navigationLink} href='/login'>
              ORDERS
            </a>
            <a className={styles.navigationLink} href='/order-history'>
              ORDER HISTORY
            </a>
            <a className={styles.navigationLink} href='/project-updates'>
              PROJECT UPDATES
            </a>
          </nav>
        </div>
      </div>
    </>
  )
}
