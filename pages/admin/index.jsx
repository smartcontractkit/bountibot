import React from 'react'

const Admin = ({ user }) => {
  if (user) {
    return (
      <div>
        In that admin page for {user.displayName}!
      </div>
    )
  }

  return <></>
}

export default Admin
