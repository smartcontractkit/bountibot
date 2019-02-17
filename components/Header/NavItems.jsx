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
    },
    navItem: {
      width: 'auto'
    }
  }
}

const Item = ({ children, classes }) => {
  return (
    <ListItem className={classes.navItem}>
      {children}
    </ListItem>
  )
}

const Admin = props => {
  return (
    <>
      <Item {...props}>
        <NavLink href="/admin">Admin</NavLink>
      </Item>
      <Item {...props}>
        <NavLink href="/admin/prs">PRs</NavLink>
      </Item>
    </>
  )
}

const User = () => <></>

const Authenticated = props => props.user.admin ? <Admin {...props} /> : <User {...props} />

const NavItems = props => {
  const { classes, user } = props

  return (
    <List className={classes.navList}>
      <Item {...props}>
        <NavLink href="/">Home</NavLink>
      </Item>
      {user && <Authenticated {...props} />}
    </List>
  )
}

export default withStyles(styles)(NavItems)
