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
  const user = req && req.session ? req.session.user : null
  return { config: await res.json(), initialUser: user }
}

// https://github.com/zeit/next.js/blob/canary/examples/with-firebase-authentication/pages/index.js
const postAuthChange = user => {
  if (user) {
    return user.getIdToken().then(token => {
      // eslint-disable-next-line no-undef
      return fetch('/api/login', {
        method: 'POST',
        // eslint-disable-next-line no-undef
        headers: new Headers({ 'Content-Type': 'application/json' }),
        credentials: 'same-origin',
        body: JSON.stringify({ token })
      })
    })
  }
  // eslint-disable-next-line no-undef
  fetch('/api/logout', {
    method: 'POST',
    credentials: 'same-origin'
  })
  return null
}

const seed = WrappedComponent => {
  const rval = ({ config, initialUser, ...props }) => {
    const [user, setUser] = useState(initialUser)

    useEffect(() => {
      const fbapp = clientSideFirebase(config)
      if (fbapp) {
        fbapp.auth().onAuthStateChanged(async userParam => {
          if (userParam) {
            const resp = await postAuthChange(userParam)
            const respjs = await resp.json()
            setUser(respjs.user)
          } else {
            setUser(null)
          }
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
