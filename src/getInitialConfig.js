import fetch from 'isomorphic-unfetch'
import initialPropsBaseUrl from './initialPropsBaseUrl'
import getSessionUser from './getSessionUser'

export default async ({ req }) => {
  const url = `${initialPropsBaseUrl(req)}/config`
  const res = await fetch(url)
  return { config: await res.json(), user: getSessionUser(req) }
}
