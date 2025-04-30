import type { AppProps } from 'next/app'
import { SSRProvider } from 'react-bootstrap'
import Layout from '@/components/Layout'
import { SessionProvider } from 'next-auth/react'
import '@/styles/globals.scss'
import { NuqsAdapter } from 'nuqs/adapters/next/pages'

export default function App({
  Component,
  pageProps: { session, ...pageProps },
}: AppProps) {
  return (
    <SSRProvider>
      <SessionProvider session={session}>
        <Layout>
          <NuqsAdapter>
            <Component {...pageProps} />
          </NuqsAdapter>
        </Layout>
      </SessionProvider>
    </SSRProvider>
  )
}
