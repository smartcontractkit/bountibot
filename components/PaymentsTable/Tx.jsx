import React from 'react'
import Link from './Link'

const Tx = ({ children }) => {
  if (children) {
    const short = `${children.slice(0, 6)}...`
    return (
      <Link href={`https://etherscan.io/address/${children}`}>
        {short}
      </Link>
    )
  }

  return '-'
}

export default Tx
