import React from 'react'
import { useTranslation } from 'react-i18next'
import Table from '@material-ui/core/Table'
import TableBody from '@material-ui/core/TableBody'
import TableCell from '@material-ui/core/TableCell'
import TableHead from '@material-ui/core/TableHead'
import TableRow from '@material-ui/core/TableRow'

const Empty = () => {
  const { t } = useTranslation()
  return <p>{t('Empty')}</p>
}

const Prs = ({ prs }) => {
  const { t } = useTranslation()

  return (
    <Table>
      <TableHead>
        <TableRow>
          <TableCell>{t('ID')}</TableCell>
          <TableCell>{t('Title')}</TableCell>
          <TableCell>{t('Status')}</TableCell>
          <TableCell>{t('Author')}</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {prs.map(pr => (
          <TableRow key={pr.id}>
            <TableCell>{pr.id}</TableCell>
            <TableCell>{pr.title}</TableCell>
            <TableCell>{pr.status}</TableCell>
            <TableCell>{pr.author}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
// eslint-disable-next-line react/destructuring-assignment
const Render = props => props.prs.length > 0 ? <Prs {...props} /> : <Empty />

const Index = class extends React.Component {
  static async getInitialProps({ req }) {
    return {
      prs: [
        { id: 1, title: 'Open PR and get comment', status: 'open', author: 'John Barker' },
        { id: 2, title: 'Admin backend shows list of submitted PRs', status: 'accepted', author: 'Alex Kwiatkowski' }
      ]
    }
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
