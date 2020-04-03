import { graphql } from '@octokit/graphql'

const withAuth = token =>
  graphql.defaults({
    headers: {
      authorization: `token ${token}`
    }
  })

export { withAuth }
