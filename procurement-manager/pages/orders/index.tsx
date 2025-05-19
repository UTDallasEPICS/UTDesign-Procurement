/**
 * This file is a redirector to the Orders Page.
 */

import Head from 'next/head'
import { useRouter } from 'next/router'
import { Row, Spinner } from 'react-bootstrap'
import { useSession } from 'next-auth/react'
import { User } from '@prisma/client'

export async function getServerSideProps() {
  return {
    props: {
      title: 'Orders - Procurement Manager',
      description: 'University of Texas at Dallas',
    },
  }
}

export default function Index({ title }: { title: string }) {
  const router = useRouter()
  const { data: session } = useSession()
  const user = session?.user as User

  // Different roles pushes to their respective pages
  if (session) {
    if (user.roleID === 1) router.push('/orders/admin')
    else if (user.roleID === 2) router.push('/orders/mentor')
    else if (user.roleID === 3) router.push('/orders/student')
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
