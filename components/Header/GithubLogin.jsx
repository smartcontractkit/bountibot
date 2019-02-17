import React, { useContext } from 'react'
import { withStyles } from '@material-ui/core/styles'
import Button from '@material-ui/core/Button'
import * as firebase from 'firebase/app'
import 'firebase/auth'
import { FirebaseContext } from '../FirebaseContext'

const styles = _theme => {
  return {
    button: {
      textTransform: 'none'
    }
  }
}

const GithubLogin = ({ classes }) => {
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
    <Button
      variant="contained"
      className={classes.button}
      onClick={login}
    >
      Sign In via GitHub
    </Button>
  )
}

export default withStyles(styles)(GithubLogin)
