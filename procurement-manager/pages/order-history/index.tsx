import React, { useContext, useEffect } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'

export default function index({ title }: { title: string }) {
  const router = useRouter()
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
      title: 'Order History - Procurement Manager',
      description: 'University of Texas at Dallas',
    },
  }
}
