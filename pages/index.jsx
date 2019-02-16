import React, { useContext, useEffect, useState } from 'react'
import { seed } from '../components/seed'
import { FirebaseContext } from '../components/FirebaseContext'
import 'firebase/firestore'

const Home = () => {
  const firebase = useContext(FirebaseContext)
  const [jokes, setJokes] = useState([])

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
    <React.Fragment>
      <div>Welcome to next.js!</div>
      <ul>
        {jokes.map(j => (
          <li>{j.message}</li>
        ))}
      </ul>
    </React.Fragment>
  )
}

export default seed(Home)
