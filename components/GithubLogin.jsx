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

  const logout = async () => {
    firebase.auth().signOut()
    Router.push('/')
  }

  const navigateToAdmin = async () => {
    // buggy nextjs doesn't navigate properly, even w Link:
    // https://github.com/zeit/next.js/issues/5598
    // Router.push('/admin') //
    window.location.href = '/admin'
  }

  if (user) {
    return (
      <div>
        <span>Welcome {user.displayName}</span>
        {user.admin && (
          <button type="button" onClick={navigateToAdmin}>
            admin
          </button>
        )}
        <button type="button" onClick={logout}>
          Logout
        </button>
      </div>
    )
  }
  return (
    <Fragment>
      <button type="button" onClick={login}>
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
