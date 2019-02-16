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

const Admin = () => {
  return (
    <>
      <ListItem>
        <NavLink href="/admin">Admin</NavLink>
      </ListItem>
      <ListItem>
        <NavLink href="/admin/prs">PRs</NavLink>
      </ListItem>
    </>
  )
}

const User = () => <></>

const Authenticated = ({ user }) => user.admin ? <Admin /> : <User />

const NavItems = ({ classes, user }) => {
  return (
    <List className={classes.navList}>
      <ListItem>
        <NavLink href="/">Home</NavLink>
      </ListItem>
      {user && <Authenticated user={user} />}
    </List>
  )
}

export default withStyles(styles)(NavItems)
