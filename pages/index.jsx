import React, { useContext, useEffect, useState } from 'react'
import { withStyles } from '@material-ui/core/styles'
import Typography from '@material-ui/core/Typography'
import Grid from '@material-ui/core/Grid'
import fetch from 'isomorphic-unfetch'
import { initialPropsBaseUrl as baseUrl, seed } from '../components/seed'
import { FirebaseContext } from '../components/FirebaseContext'
import 'firebase/firestore'
import robotPirate from '../images/robot-pirate.png'

const styles = _theme => {
  return {
    container: {
      marginTop: 40
    },
    pirateContainer: {
      position: 'relative'
    },
    greeting: {
      backgroundColor: '#fff',
      border: 'solid 1px #f3f3f3',
      borderRadius: 20,
      position: 'absolute',
      top: 50,
      marginLeft: 300,
      padding: 30,
      fontSize: 19
    }
  }
}

const Home = ({ seedJokes, classes }) => {
  const firebase = useContext(FirebaseContext)
  const [jokes, setJokes] = useState(seedJokes)

  useEffect(() => {
    firebase
      .firestore()
      .collection('dimitris_jokes')
      .onSnapshot(querySnapshot => {
        const queryJokes = []
        querySnapshot.forEach(doc => {
          queryJokes.push(doc.data())
        })
        setJokes(queryJokes)
      })
  })

  return (
    <Grid container justify="center" className={classes.container}>
      <Grid item xs={3}></Grid>
      <Grid item xs={6}>
        <div className={classes.pirateContainer}>
          <img
            src={robotPirate}
            width={400}
          />
          <Typography variant="body1" component='div' className={classes.greeting}>
            Start contributin' Pull Requests t' earn yourself a tidy Bounty o' LINK
          </Typography>
        </div>
      </Grid>
      <Grid item xs={3}></Grid>
    </Grid>
  )
}

Home.getInitialProps = async ({ req }) => {
  // have to hit server endpoint when SSRing
  const res = await fetch(baseUrl(req) + `/jokes`)
  const resJSON = await res.json()
  return { seedJokes: resJSON.jokes }
}

export default withStyles(styles)(seed(Home))
