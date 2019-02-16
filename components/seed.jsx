import { useEffect, useState, React } from 'react'
import { clientSideFirebase, FirebaseContext } from './FirebaseContext'
import UserContext from './UserContext'

const seed = WrappedComponent => props => {
  const [user, setUser] = useState(null)

  useEffect(() => {
    const fbapp = clientSideFirebase()
    if (fbapp) {
      fbapp.onAuthStateChanged(userParam => {
        setUser(userParam)
      })
    }
  }, [])

  return (
    <FirebaseContext.Provider value={clientSideFirebase()}>
      <UserContext.Provider value={user}>
        <WrappedComponent {...props} user={user} />
      </UserContext.Provider>
    </FirebaseContext.Provider>
  )
}

export default seed
