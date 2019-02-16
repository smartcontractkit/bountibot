import React, { useEffect, useState } from 'react'
import fetch from 'isomorphic-unfetch'
import 'firebase/auth'
import { clientSideFirebase, FirebaseContext } from './FirebaseContext'
import GithubLogin from './GithubLogin'
import UserContext from './UserContext'

export const initialPropsBaseUrl = req => {
  return req ? `${req.protocol}://${req.get('Host')}` : ''
}

export const getSessionUser = req => {
  return req && req.session ? req.session.user : null
}

export const getInitialConfig = async ({ req }) => {
  const url = initialPropsBaseUrl(req) + `/config`
  const res = await fetch(url)
  return { config: await res.json(), user: getSessionUser(req) }
}

// https://github.com/zeit/next.js/blob/canary/examples/with-firebase-authentication/pages/index.js
const postLogin = async user => {
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

const postLogout = async () => {
  // eslint-disable-next-line no-undef
  return fetch('/api/logout', {
    method: 'POST',
    credentials: 'same-origin'
  })
}

export const seed = WrappedComponent => {
  const rval = ({ config, user, ...props }) => {
    const [currentUser, setCurrentUser] = useState(user)

    useEffect(() => {
      const fbapp = clientSideFirebase(config)
      if (fbapp) {
        fbapp.auth().onAuthStateChanged(async userParam => {
          if (userParam) {
            const resp = await postLogin(userParam)
            const respjs = await resp.json()
            setCurrentUser(respjs.user)
          } else {
            await postLogout()
            setCurrentUser(null)
          }
        })
      }
    }, [])

    return (
      <FirebaseContext.Provider value={clientSideFirebase(config)}>
        <UserContext.Provider value={currentUser}>
          <GithubLogin />
          <WrappedComponent {...props} user={currentUser} />
        </UserContext.Provider>
      </FirebaseContext.Provider>
    )
  }

  rval.getInitialProps = async ctx => {
    const initialProps = await getInitialConfig(ctx)
    let wrappedProps = {}
    if (WrappedComponent.getInitialProps) {
      wrappedProps = await WrappedComponent.getInitialProps(ctx)
    }
    return { ...initialProps, ...wrappedProps }
  }
  return rval
}

export default seed
