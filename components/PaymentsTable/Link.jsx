import React from 'react'
import { withStyles } from '@material-ui/core/styles'
import Link from '@material-ui/core/Link'

const styles = _theme => {
  return {
    link: {
      color: '#ff8427'
    }
  }
}

const MyLink = ({ children, href, classes }) => {
  return (
    <Link className={classes.link} href={href}>
      {children}
    </Link>
  )
}

export default withStyles(styles)(MyLink)
