import '@/styles/globals.css'
import 'bootstrap/dist/css/bootstrap.min.css'
import type { AppProps } from 'next/app'
import { SSRProvider } from 'react-bootstrap'
import Layout from '@/components/Layout'
import { Dispatch, SetStateAction, createContext, useState } from 'react'
import { User } from '@prisma/client'
// import '@/styles/request.css'

/* 
UserContext provides user-related values that we can use in all components
NOTE :: This is not secure at all and this is not the right way to do authentication
I just needed a quick fake auth to demo the app
*/
export const UserContext = createContext<{
  user: User | undefined
  setUser: Dispatch<SetStateAction<User | undefined>>
  loggedIn: boolean
  setLoggedIn: Dispatch<SetStateAction<boolean>>
} | null>(null)

export default function App({ Component, pageProps }: AppProps) {
  const [user, setUser] = useState<User>()
  const [loggedIn, setLoggedIn] = useState<boolean>(false)

  const UserContextValues = {
    user,
    setUser,
    loggedIn,
    setLoggedIn,
  }

  return (
    <SSRProvider>
      <UserContext.Provider value={UserContextValues}>
        <Layout>
          <Component {...pageProps} />
        </Layout>
      </UserContext.Provider>
    </SSRProvider>
  )
}
