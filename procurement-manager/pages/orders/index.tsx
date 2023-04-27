import React from 'react'
import Mentor from './mentor'
import Head from 'next/head'

export default function index({
  roleID,
  title,
}: {
  roleID: number
  title: string
}) {
  return (
    <>
      <Head>
        <title>{title}</title>
      </Head>
      {roleID == 2 && <Mentor></Mentor>}
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
