const chalk = require('chalk')
const { graphql } = require('@octokit/graphql')

const {
  infoMessage
} = require('../logger/logger')

let token

const fetchRepositories = async ({ name }) => {
  const graphqlWithAuth = graphql.defaults({
    headers: {
      authorization: `token ${token}`
    }
  })

  const query =
    `
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

const checkSystemTeamPresent = async (organizationRepositories) => {
   infoMessage(chalk`Not implemented yet`) 
}

const checkSystemTeam = async (config) => {
  token = config.githubToken
  const organizations = []
  for (const organization of config.organizations) {
    let organizationRepositories = []
    infoMessage(chalk`{blue organization: } ${organization.name}`)
    organizationRepositories = await fetchRepositories(organization, config.githubTokenj)
    await checkSystemTeamPresent(organizationRepositories)
  }
}

module.exports = {
  checkSystemTeam 
}
