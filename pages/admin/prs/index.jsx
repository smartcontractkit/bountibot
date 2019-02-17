import React from 'react'
import fetch from 'isomorphic-unfetch'
import PrTable from '../../../components/PrTable'
import { initialPropsBaseUrl as baseUrl } from '../../../components/seed'

const Index = class extends React.Component {
  static async getInitialProps({ req }) {
    // have to hit server endpoint when SSRing
    const res = await fetch(baseUrl(req) + `/prs`)
    const resJSON = await res.json()

    return { prs: resJSON.prs }
  }

  render() {
    const { user, prs } = this.props

    if (user) {
      return <PrTable prs={prs} />
    }

    return <></>
  }
}

export default Index
