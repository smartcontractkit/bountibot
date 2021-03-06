import Router from 'next/router'
import * as firebase from 'firebase/app'
import 'firebase/auth'
import React, { Fragment, useContext } from 'react'
import { FirebaseContext } from './FirebaseContext'
import UserContext from './UserContext'

const GithubLogin = () => {
  const fbapp = useContext(FirebaseContext)
  const user = useContext(UserContext)

  const login = async () => {
    const provider = new firebase.auth.GithubAuthProvider()

    fbapp
      .auth()
      .signInWithPopup(provider)
      .catch(error => {
        console.error('failed to sign in', error)
      })
  }

  return <></>
}

export default GithubLogin


