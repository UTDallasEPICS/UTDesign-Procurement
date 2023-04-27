import React, { useContext, useEffect } from 'react'
import Mentor from './mentor'
import Head from 'next/head'
import { UserContext } from '../_app'
import { useRouter } from 'next/router'

export default function index({ title }: { title: string }) {
  const userContext = useContext(UserContext)
  const router = useRouter()

  useEffect(() => {
    if (!userContext?.loggedIn) {
      router.push('/login')
    }

    if (userContext?.user?.roleID === 2) {
      router.push('/orders/mentor')
    }
  }, [])

  return (
    <>
      <Head>
        <title>{title}</title>
      </Head>
      Not ready yet
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
