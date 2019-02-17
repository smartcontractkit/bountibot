import React, { useContext } from 'react'
import * as firebase from 'firebase/app'
import 'firebase/auth'
import { FirebaseContext } from '../FirebaseContext'

const GithubLogin = () => {
  const fbapp = useContext(FirebaseContext)

  const login = async () => {
    const provider = new firebase.auth.GithubAuthProvider()

    fbapp
      .auth()
      .signInWithPopup(provider)
      .catch(error => {
        console.error('failed to sign in', error)
      })
  }

  return (
    <button type="button" onClick={login}>
      Sign In w GitHub
    </button>
  )
}

export default GithubLogin
