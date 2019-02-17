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

const Item = ({ children }) => {
  return (
    <ListItem style={{ 'justify-content': 'flex-end' }}>
      {children}
    </ListItem>
  )
}

const AuthenticatedNavItems = () => {
  return (
    <Item>
      <NavLink href="/logout">Logout</NavLink>
    </Item>
  )
}

const UnauthenticatedNavItems = () => {
  return (
    <Item>
      <NavLink href="/login">Login</NavLink>
    </Item>
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
