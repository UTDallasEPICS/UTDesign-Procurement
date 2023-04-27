import React from 'react'
import NavBar from './NavBar'
import { Container } from 'react-bootstrap'

interface LayoutProps {
  children: React.ReactNode
}

export default function Layout({ children }: LayoutProps): JSX.Element {
  return (
    <>
      <NavBar />
      <Container>{children}</Container>
    </>
  )
}
