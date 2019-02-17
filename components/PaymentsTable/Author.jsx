import React from 'react'
import Link from './Link'

const Author = ({ children }) => {
  return (
    <Link
      href={`https://github.com/${children}`}
    >
      {children}
    </Link>
  )
}

export default Author
