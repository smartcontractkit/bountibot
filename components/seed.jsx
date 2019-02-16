import React, { useEffect, useState } from 'react'
import fetch from 'isomorphic-unfetch'
import 'firebase/auth'
import { clientSideFirebase, FirebaseContext } from './FirebaseContext'
import GithubLogin from './GithubLogin'
import UserContext from './UserContext'

const initialPropsBaseUrl = req => {
  return req ? `${req.protocol}://${req.get('Host')}` : ''
}

const getInitialConfig = async ({ req }) => {
  const url = initialPropsBaseUrl(req) + `/config`
  const res = await fetch(url)
  return { config: await res.json() }
}

const seed = WrappedComponent => {
  const rval = ({ config, ...props }) => {
    const [user, setUser] = useState(null)

    useEffect(() => {
      const fbapp = clientSideFirebase()
      if (fbapp) {
        fbapp.auth().onAuthStateChanged(userParam => {
          setUser(userParam)
        })
      }
    }, [])

    return (
      <FirebaseContext.Provider value={clientSideFirebase(config)}>
        <UserContext.Provider value={user}>
          <GithubLogin />
          <WrappedComponent {...props} user={user} />
        </UserContext.Provider>
      </FirebaseContext.Provider>
    )
  }

  rval.getInitialProps = getInitialConfig
  return rval
}

export default seed
