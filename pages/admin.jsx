import React from 'react'
import Router from 'next/router'
import { getSessionUser, initialPropsBaseUrl, seed } from '../components/seed'

const Admin = ({user}) => {
  if (!user) {
    Router.push('/')
    return null
  }
  return <div>In that admin page for {user.displayName}!</div>
}

Admin.getInitialProps = ({ req, res }) => {
  const user = getSessionUser(req)
  if (user && user.admin) {
    return {}
  }

  if (res) {
    res.writeHead(302, {
      Location: initialPropsBaseUrl(req)
    })
    res.end()
  } else {
    Router.push('/')
  }
  return {} // user is already populated through seed
}

export default seed(Admin)
