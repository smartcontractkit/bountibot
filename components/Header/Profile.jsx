import React from 'react'
import { withStyles } from '@material-ui/core/styles'
import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import NavLink from './NavLink'

const styles = _theme => {
  return {
    navList: {
      display: 'flex',
      flexDirection: 'row',
      padding: 0
    }
  }
}

const AuthenticatedNavItems = () => {
  return (
    <ListItem>
      <NavLink href="/logout">Logout</NavLink>
    </ListItem>
  )
}

const UnauthenticatedNavItems = () => {
  return (
    <ListItem>
      <NavLink href="/login">Login</NavLink>
    </ListItem>
  )
}

const Profile = ({ user, classes }) => {
  return (
    <List className={classes.navList}>
      {user ? <AuthenticatedNavItems /> : <UnauthenticatedNavItems />}
    </List>
  )
}

export default withStyles(styles)(Profile)
