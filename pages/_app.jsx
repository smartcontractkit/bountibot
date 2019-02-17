import React from 'react';
import Router from 'next/router'
import App, { Container } from 'next/app'
import Head from 'next/head'
import { MuiThemeProvider } from '@material-ui/core/styles'
import CssBaseline from '@material-ui/core/CssBaseline'
import JssProvider from 'react-jss/lib/JssProvider'
import 'firebase/auth'
import { clientSideFirebase, FirebaseContext } from '../components/FirebaseContext'
import UserContext from '../components/UserContext'
import getPageContext from '../src/getPageContext';
import getInitialConfig from '../src/getInitialConfig'
import Header from '../components/Header'

const isAuthorized = (user, router) => {
  if (user === undefined) {
    return router.pathname === '/login'
  }

  if (user.admin) {
    return true
  }

  return !user.admin && !router.pathname.match(/^\/admin/)
}

// https://github.com/zeit/next.js/blob/canary/examples/with-firebase-authentication/pages/index.js
const postLogin = async user => {
  return user.getIdToken().then(token => {
    // eslint-disable-next-line no-undef
    return fetch('/api/login', {
      method: 'POST',
      // eslint-disable-next-line no-undef
      headers: new Headers({ 'Content-Type': 'application/json' }),
      credentials: 'same-origin',
      body: JSON.stringify({ token })
    })
  })
}

const postLogout = async () => {
  // eslint-disable-next-line no-undef
  return fetch('/api/logout', {
    method: 'POST',
    credentials: 'same-origin'
  })
}

class MyApp extends App {
  constructor(props) {
    super(props);
    this.pageContext = getPageContext();
  }

  pageContext = null;

  componentDidMount() {
    const { pageProps, router } = this.props
    const { user, config } = pageProps

    const fbapp = clientSideFirebase(config)
    if (fbapp) {
      fbapp.auth().onAuthStateChanged(async userParam => {
        if (userParam) {
          const resp = await postLogin(userParam)
          const respjs = await resp.json()
        } else {
          await postLogout()
        }
      })
    }

    if (isAuthorized(user, router)) {
      // Remove the server-side injected CSS.
      const jssStyles = document.querySelector('#jss-server-side');
      if (jssStyles && jssStyles.parentNode) {
        jssStyles.parentNode.removeChild(jssStyles);
      }
    } else {
      Router.push('/')
    }
  }

  render() {
    const { Component, pageProps } = this.props;
    const { config, user } = pageProps

    return (
      <Container>
        <Head>
          <title>Bountibot</title>
        </Head>
        {/* Wrap every page in Jss and Theme providers */}
        <JssProvider
          registry={this.pageContext.sheetsRegistry}
          generateClassName={this.pageContext.generateClassName}
        >
          {/* MuiThemeProvider makes the theme available down the React
              tree thanks to React context. */}
          <MuiThemeProvider
            theme={this.pageContext.theme}
            sheetsManager={this.pageContext.sheetsManager}
          >
            {/* CssBaseline kickstart an elegant, consistent, and simple baseline to build upon. */}
            <CssBaseline />
            {/* Pass pageContext to the _document though the renderPage enhancer
                to render collected styles on server side. */}
            <React.Fragment>
              <FirebaseContext.Provider value={clientSideFirebase(config)}>
                <UserContext.Provider value={user}>
                  <Header user={user} />
                  <Component pageContext={this.pageContext} {...pageProps} />
                </UserContext.Provider>
              </FirebaseContext.Provider>
            </React.Fragment>
          </MuiThemeProvider>
        </JssProvider>
      </Container>
    );
  }
}

MyApp.getInitialProps = async ({ Component, router, ctx }) => {
  let pageProps = {}

  const initialConfig = await getInitialConfig(ctx)

  if (Component.getInitialProps) {
    pageProps = await Component.getInitialProps(ctx)
  }

  return {
    pageProps: {
      ...pageProps,
      ...initialConfig
    }
  }
}

export default MyApp
