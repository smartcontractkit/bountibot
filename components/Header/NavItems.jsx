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
        <NavLink href="/admin/prs">Manage PR's</NavLink>
      </Item>
    </>
  )
}

const User = () => <></>

const Authenticated = props => {
  return (
    <>
      <Item {...props}>
        <NavLink href="/my_prs">My Submitted PR's</NavLink>
      </Item>
      <Item {...props}>
        <NavLink href="/my_payments">My Payments</NavLink>
      </Item>
      {props.user.admin ? <Admin {...props} /> : <User {...props} />}
    </>
  )
}

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
