import React, { useContext } from 'react'
import Button from '@material-ui/core/Button'
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
      .then(() => {
        global.location.reload()
      })
      .catch(error => {
        console.error('failed to sign in', error)
      })
  }

  return (
    <Button variant="contained" onClick={login}>
      Sign In w GitHub
    </Button>
  )
}

export default GithubLogin
