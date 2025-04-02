/**
 * This component is used throughout every page in the application to show navbar and container.
 */

import { ReactNode } from 'react'
import NavBar from './NavBar'
import { Container } from 'react-bootstrap'

interface LayoutProps {
  children: ReactNode
}

export default function Layout({ children }: LayoutProps): JSX.Element {
  return (
    <>
      <NavBar />
      <Container >{children}</Container>
    </>
  )
}
