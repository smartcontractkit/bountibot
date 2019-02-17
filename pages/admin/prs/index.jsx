import React from 'react'
import fetch from 'isomorphic-unfetch'
import { useTranslation } from 'react-i18next'
import PrTable from '../../../components/PrTable'
import { initialPropsBaseUrl as baseUrl } from '../../../components/seed'

const Empty = () => {
  const { t } = useTranslation()
  return <p>{t('Empty')}</p>
}

// eslint-disable-next-line react/destructuring-assignment
const Render = props => props.prs.length > 0 ? <PrTable {...props} /> : <Empty />


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
      return <Render prs={prs} />
    }

    return <></>
  }
}

export default Index
