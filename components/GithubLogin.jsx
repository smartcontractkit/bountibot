import * as firebase from 'firebase/app'
import 'firebase/auth'
import React, { Fragment, useContext } from 'react'
import { FirebaseContext } from './FirebaseContext'
import UserContext from './UserContext'

const GithubLogin = () => {
  const fbapp = useContext(FirebaseContext)
  const user = useContext(UserContext)

  const signin = async () => {
    const provider = new firebase.auth.GithubAuthProvider()

    fbapp
      .auth()
      .signInWithPopup(provider)
      .catch(error => {
        console.error('failed to sign in', error)
      })
  }

  if (user) {
    return <span>Welcome {user.displayName}</span>
  }
  return (
    <Fragment>
      <button type="button" onClick={signin}>
        Sign In w GitHub
      </button>
      <style jsx>
        {`
          a {
            font-family: 'Arial';
            text-decoration: none;
            color: blue;
            cursor: pointer;
          }

          a:hover {
            opacity: 0.6;
          }
        `}
      </style>
    </Fragment>
  )
}

export default GithubLogin
