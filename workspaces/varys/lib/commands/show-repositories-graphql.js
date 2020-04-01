const chalk = require('chalk')
const columnify = require('columnify')

const { withAuth } = require('../graphql')
const { infoMessage } = require('../logger')

const fetchRepositories = async ({ name, token }) => {
  const graphqlWithAuth = withAuth(token)

  const query = `
      query organizationRepositories($owner: String!) {
        organization(login:$owner) {
          repositories(first: 100) {
            totalCount
            nodes {
              name
              id
              url
              isPrivate
              stargazers(first: 100) {
                totalCount
              }
              watchers(first: 100) {
                totalCount
              }
              forkCount
              isFork
              createdAt
              updatedAt
              pushedAt
              isArchived
              object(expression: "master") {
                ... on Commit {
                  history {
                    totalCount
                  }
                }
              }
            }
          }
        }
      }
    `

  try {
    return await graphqlWithAuth(query, { owner: name })
  } catch (error) {
    console.log('Request failed:', error.request)
    console.log(error.message)
  }
}

const displayRepositories = organizations => {
  const data = organizations.flatMap(org =>
    org.repositories.organization.repositories.nodes.map(repo => ({
      organisation: org.organizationName,
      name: repo.name,
      url: repo.url,
      private: repo.isPrivate,
      totalCommits: repo.object && repo.object.history.totalCount,
      contributors: 'N/A'
    }))
  )

  console.log(columnify(data))
}

const showRepositories = async (config, filterOrgs) => {
  const organizations = []
  const fetchOrgs =
    filterOrgs.length > 0
      ? filterOrgs.map(org => ({ name: org }))
      : config.organizations

  for (const organization of fetchOrgs) {
    let organizationRepositories = []
    infoMessage(chalk`{blue organization: } ${organization.name}`)
    organizationRepositories = await fetchRepositories({
      ...organization,
      token: config.githubToken
    })
    organizations.push({
      organizationName: organization.name,
      repositories: organizationRepositories
    })
  }
  displayRepositories(organizations)
}

module.exports = {
  showRepositories,
  fetchRepositories
}
