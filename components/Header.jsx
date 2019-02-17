import React from 'react'
import AppBar from '@material-ui/core/AppBar'
import Toolbar from '@material-ui/core/Toolbar'
import Grid from '@material-ui/core/Grid'
import NavItems from './Header/NavItems'
import Profile from './Header/Profile'

const Header = props => {
  return (
    <AppBar position="static" elevation={1}>
      <Toolbar>
        <Grid container>
          <Grid item xs={9}>
            <NavItems {...props} />
          </Grid>
          <Grid item xs={3}>
            <Profile {...props} />
          </Grid>
        </Grid>
      </Toolbar>
    </AppBar>
  )
}

export default Header
