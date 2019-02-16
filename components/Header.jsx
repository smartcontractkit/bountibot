import React from 'react'
import AppBar from '@material-ui/core/AppBar'
import Toolbar from '@material-ui/core/Toolbar'
import NavItems from './Header/NavItems'
import Profile from './Header/Profile'

const Header = props => {
  return (
    <AppBar position="static">
      <Toolbar>
        <NavItems {...props} />
        <Profile {...props} />
      </Toolbar>
    </AppBar>
  )
}

export default Header
