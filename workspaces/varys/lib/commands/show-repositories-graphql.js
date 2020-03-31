const chalk = require('chalk')
const { graphql } = require('@octokit/graphql')

const { infoMessage } = require('../logger')

const fetchRepositories = async ({ name, token }) => {
  const graphqlWithAuth = graphql.defaults({
    headers: {
      authorization: `token ${token}`
    }
  })

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
const displayRepository = (organizationName, repository) => {
  console.log(
    `${organizationName}|${repository.name}|${repository.url}|${
      repository.isPrivate
    }|${repository.object && repository.object.history.totalCount}|N/A`
  )
}

const displayRepositories = async organizations => {
  console.log(
    'organization|reposiitory name|repository url|isPrivate|# commits|# contributors'
  )
  for (const organization of organizations) {
    const { repositories } = await organization.repositories.organization
    for (const repository of repositories.nodes) {
      displayRepository(organization.organizationName, repository)
    }
  }
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
  showRepositories
}
