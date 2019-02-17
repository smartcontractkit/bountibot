import React, { useContext, useEffect, useState } from 'react'
import fetch from 'isomorphic-unfetch'
import { initialPropsBaseUrl as baseUrl, seed } from '../components/seed'
import { FirebaseContext } from '../components/FirebaseContext'
import 'firebase/firestore'

const Home = ({ seedJokes }) => {
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
    <>
      <ul>
        {jokes.map((j, idx) => (
          <li key={idx}>{j.message}</li>
        ))}
      </ul>
    </>
  )
}

Home.getInitialProps = async ({ req }) => {
  // have to hit server endpoint when SSRing
  const res = await fetch(baseUrl(req) + `/jokes`)
  const resJSON = await res.json()
  return { seedJokes: resJSON.jokes }
}

export default seed(Home)
