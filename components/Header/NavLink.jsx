import React from 'react'
import Link from '@material-ui/core/Link'

const NavLink = ({ children, href }) => {
  return (
    <Link href={href} color="textSecondary">
      {children}
    </Link>
  )
}

export default NavLink
