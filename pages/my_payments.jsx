import React from 'react'
import fetch from 'isomorphic-unfetch'
import PaymentsTable from '../components/PaymentsTable'
import { initialPropsBaseUrl as baseUrl } from '../components/seed'

const payments = (prs, user) => {
  console.log(user)
  return prs.filter(pr => pr.email === user.email)
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
