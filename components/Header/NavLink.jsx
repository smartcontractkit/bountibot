import React from 'react'
import Link from '@material-ui/core/Link'
import Typography from '@material-ui/core/Typography'

const NavLink = ({ children, href }) => {
  return (
    <Link href={href}>
      <Typography variant="body1" color="secondary">
        {children}
      </Typography>
    </Link>
  )
}

export default NavLink
