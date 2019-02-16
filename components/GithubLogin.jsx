import * as firebase from 'firebase/app'
import 'firebase/auth'
import { useContext, React } from 'react'
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
  return <a onClick={signin}>Sign In w GitHub</a>
}

export default GithubLogin
