import React from 'react'
import { useTranslation } from 'react-i18next'
import Table from '@material-ui/core/Table'
import TableBody from '@material-ui/core/TableBody'
import TableCell from '@material-ui/core/TableCell'
import TableHead from '@material-ui/core/TableHead'
import TableRow from '@material-ui/core/TableRow'
import Author from './PrTable/Author'
import Pr from './PrTable/Pr'

const PrTable = ({ prs }) => {
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
            <TableCell>
              <Pr>{pr.id}</Pr>
            </TableCell>
            <TableCell>{pr.title}</TableCell>
            <TableCell>{pr.status}</TableCell>
            <TableCell>
              <Author>
                {pr.author}
              </Author>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

export default PrTable
