import React, { useContext, useEffect } from 'react'
import Mentor from './mentor'
import Head from 'next/head'
import { UserContext } from '../_app'
import { useRouter } from 'next/router'
import { Row, Spinner } from 'react-bootstrap'

export default function index({ title }: { title: string }) {
  const userContext = useContext(UserContext)
  const router = useRouter()

  useEffect(() => {
    if (!userContext?.loggedIn) {
      router.push('/login')
    }

    console.log('userContext: ', userContext)

    if (userContext?.user?.roleID === 1) {
      router.push('/orders/admin')
    } else if (userContext?.user?.roleID === 2) {
      router.push('/orders/mentor')
    }
  }, [])

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

export async function getStaticProps() {
  return {
    props: {
      title: 'Orders - Procurement Manager',
      description: 'University of Texas at Dallas',
    },
  }
}
