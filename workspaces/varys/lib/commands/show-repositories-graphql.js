import chalk from 'chalk'
import columnify from 'columnify'

import { withAuth } from '../graphql'
import { infoMessage } from '../logger'

const fetchRepositories = async ({ name, token, after }) => {
  const graphqlWithAuth = withAuth(token)

  const query = `
      query organizationRepositories($owner: String!, $after: String) {
        organization(login:$owner) {
          repositories(first: 100, after: $after) {
            totalCount
            pageInfo {
              hasNextPage
              endCursor
            }
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
    return await graphqlWithAuth(query, { owner: name, after })
  } catch (error) {
    console.log('Request failed:', error.request)
    console.log(error.message)
  }
}

const displayRepositories = (organizations) => {
  const data = organizations.flatMap((org) =>
    org.repositories.organization.repositories.nodes.map((repo) => ({
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

const organizations = []

const listReposOnePage = async (config, organization, after) => {
  let organizationRepositories = await fetchRepositories({
    enterprise: config.enterprise,
    ...organization,
    token: config.githubToken,
    after: after
  })
  organizations.push({
    organizationName: organization.name,
    repositories: organizationRepositories
  })

  const pageInfo = organizationRepositories.organization.repositories.pageInfo
  return pageInfo.hasNextPage && pageInfo.endCursor
}

const showRepositories = async (config, filterOrgs) => {
  const fetchOrgs =
    filterOrgs.length > 0
      ? filterOrgs.map((org) => ({ name: org }))
      : config.organizations

  for (const organization of fetchOrgs) {
    infoMessage(chalk`{blue organization: } ${organization.name}`)

    let after = null
    do {
      infoMessage('fetching a page..')
      after = await listReposOnePage(config, organization, after)
    } while (after)
  }
  displayRepositories(organizations)
}

export { fetchRepositories, showRepositories }
