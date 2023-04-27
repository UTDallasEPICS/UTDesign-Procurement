import Head from 'next/head'
import { Inter } from 'next/font/google'
import styles from '@/styles/Home.module.scss'
import Login from '@/pages/login/index'

const inter = Inter({ subsets: ['latin'] })

export default function Home() {
  return (
    <>
      <Head>
        <title>Procurement Manager</title>
        <meta name='description' content='University of Texas at Dallas' />
        <meta name='viewport' content='width=device-width, initial-scale=1' />
        <link rel='icon' href='/favicon.ico' />
      </Head>

      {/* Just renders the login from login/index.tsx */}
      <Login></Login>
    </>
  )
}
