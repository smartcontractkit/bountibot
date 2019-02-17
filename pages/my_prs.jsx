import React from 'react'
import fetch from 'isomorphic-unfetch'
import PrTable from '../components/PrTable'
import { initialPropsBaseUrl as baseUrl } from '../components/seed'

const filterMyPrs = (prs, user) => {
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
    const myPrs = filterMyPrs(prs, user)

    if (user) {
      return (
        <PrTable
          prs={myPrs}
          emptyMessage="Arggg matey, it's time you got to work and started submittin'"
        />
      )
    }

    return <></>
  }
}

export default MyPrs
