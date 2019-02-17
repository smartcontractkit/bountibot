import React from 'react'
import { useTranslation } from 'react-i18next'
import Table from '@material-ui/core/Table'
import TableBody from '@material-ui/core/TableBody'
import TableCell from '@material-ui/core/TableCell'
import TableHead from '@material-ui/core/TableHead'
import TableRow from '@material-ui/core/TableRow'
import Typography from '@material-ui/core/Typography'
import Pr from './PaymentsTable/Pr'
import Tx from './PaymentsTable/Tx'

const RenderRows = ({ prs }) => {
  return prs.map(pr => (
    <TableRow key={pr.id}>
      <TableCell>
        <Pr>{pr.id}</Pr>
      </TableCell>
      <TableCell>
        <Tx>{pr.paidTo}</Tx>
      </TableCell>
      <TableCell>{pr.amount}</TableCell>
      <TableCell>{pr.paidAt || '-'}</TableCell>
    </TableRow>
  ))
}

const RenderEmpty = ({ emptyMessage }) => {
  return (
    <TableRow>
      <TableCell colSpan="4">
        <Typography variant='body2'>
          {emptyMessage || "There are no PR's"}
        </Typography>
      </TableCell>
    </TableRow>
  )
}

const PaymentsTable = ({ prs, emptyMessage }) => {
  const { t } = useTranslation()

  return (
    <Table>
      <TableHead>
        <TableRow>
          <TableCell>{t('Pr ID')}</TableCell>
          <TableCell>{t('Tx ID')}</TableCell>
          <TableCell>{t('Amount (LINK)')}</TableCell>
          <TableCell>{t('Paid')}</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {prs.length > 0 ? <RenderRows prs={prs} /> : <RenderEmpty emptyMessage={emptyMessage} />}
      </TableBody>
    </Table>
  )
}

export default PaymentsTable
