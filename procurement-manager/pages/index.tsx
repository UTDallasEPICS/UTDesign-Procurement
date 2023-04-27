import Head from 'next/head'
import { Inter } from 'next/font/google'
import styles from '@/styles/Home.module.scss'
import Login from '@/pages/login/index'
import { useContext, useEffect } from 'react'
import { UserContext } from './_app'
import { useRouter } from 'next/router'

const inter = Inter({ subsets: ['latin'] })

export default function Home() {
  const userContext = useContext(UserContext)
  const router = useRouter()

  useEffect(() => {
    if (userContext?.loggedIn) {
      router.push('/orders')
    }
  })

  return (
    <>
      <Head>
        <title>Procurement Manager</title>
        <meta name='description' content='University of Texas at Dallas' />
        <meta name='viewport' content='width=device-width, initial-scale=1' />
        <link rel='icon' href='/favicon.ico' />
      </Head>

      {!userContext?.loggedIn && <Login />}
    </>
  )
}
