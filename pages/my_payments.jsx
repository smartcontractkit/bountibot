import React from 'react'
import fetch from 'isomorphic-unfetch'
import PaymentsTable from '../components/PaymentsTable'
import { initialPropsBaseUrl as baseUrl } from '../components/seed'
import githubUserId from '../src/githubUserId'

const payments = (prs, user) => {
  const userId = githubUserId(user)
  return prs.filter(pr => pr.userId === userId)
}

const MyPrs = class extends React.Component {
  static async getInitialProps({ req }) {
    // have to hit server endpoint when SSRing
    const res = await fetch(baseUrl(req) + `/prs`)
    const resJSON = await res.json()

    return { prs: resJSON.prs }
  }

  render() {
    const { user, prs } = this.props
    const myPrs = payments(prs, user)

    if (user) {
      return (
        <PaymentsTable
          prs={myPrs}
          emptyMessage="Ahoy, Th' Captain hasn't handed out any loot yet"
        />
      )
    }

    return <></>
  }
}

export default MyPrs
