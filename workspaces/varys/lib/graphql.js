const { graphql } = require('@octokit/graphql')

module.exports = {
  withAuth: token =>
    graphql.defaults({
      headers: {
        authorization: `token ${token}`
      }
    })
}
