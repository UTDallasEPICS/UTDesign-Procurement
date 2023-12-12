/**
 * This file is a redirector to the Projects Page.
 */

import Head from 'next/head'
import { useRouter } from 'next/router'
import { Row, Spinner } from 'react-bootstrap'
import { useSession } from 'next-auth/react'
import { User } from '@prisma/client'

export async function getServerSideProps() {
  return {
    props: {
      title: 'Projects - Procurement Manager',
      description: 'University of Texas at Dallas',
    },
  }
}

export default function index({ title }: { title: string }) {
  const router = useRouter()
  const { data: session } = useSession()
  const user = session?.user as User

  // Different roles pushes to their respective pages
  if (session) {
    if (user.roleID === 1) router.push('/projects/admin')
    else if (user.roleID === 2) router.push('/projects/mentor')
  } else
    return (
      <>
        <Head>
          <title>{title}</title>
        </Head>
        <Row className='w-100 d-flex justify-content-center'>
          <Spinner animation='border' role='status'>
            <span className='visually-hidden'>Loading...</span>
          </Spinner>
        </Row>
      </>
    )
}
