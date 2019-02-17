import React from 'react'
import Link from './Link'

const Pr = ({ children }) => {
  return (
    <Link href={`https://github.com/smartcontractkit/bountibot/pull/${children}`}>
      #{children}
    </Link>
  )
}

export default Pr
