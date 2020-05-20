import chalk from 'chalk'
import columnify from 'columnify'

import { withAuth } from '../graphql'
import { infoMessage } from '../logger'
import { byKey } from '../data'

const fetchTopics = async ({ name, token }) => {
  const graphqlWithAuth = withAuth(token)

  // TODO Use cursor to loop to all repositories
  // TODO Use cursor to loop to all repositoryTopics
  const query = `query GetTopics($owner: String!) {
    organization(login: $owner) {
      repositories(first: 100) {
        totalCount
        nodes {
          id
          name
          url
          repositoryTopics(first: 25) {
            totalCount
            nodes {
              topic {
                name
              }
              url
            }
          }
        }
      }
    }
  }`

  try {
    return await graphqlWithAuth(query, { owner: name })
  } catch (error) {
    console.log('Request failed:', error.request)
    console.log(error.message)
  }
}

const groupBy = (collection, key, map) => [
  ...collection
    .reduce((acc, cur) => {
      const item = acc.get(cur[key]) || { ...cur }
      return acc.set(cur[key], map(item, cur))
    }, new Map())
    .values()
]

const topicData = (topic) => ({
  topic: topic.topic.name,
  url: topic.url
})

const displayRepos = (item, showRepos) => {
  const { repos, ...strippedRepos } = item
  return showRepos ? { ...item, repos: repos.join(', ') } : strippedRepos
}

const displayTopics = (organizations, { showRepos }) => {
  const data = organizations.flatMap((org) =>
    org.repositories.organization.repositories.nodes.flatMap((repo) =>
      repo.repositoryTopics.nodes.map((topic) => ({
        ...topicData(topic),
        organization: org.organizationName,
        repo: repo.name
      }))
    )
  )

  const topics = groupBy(data, 'topic', (item, cur) => {
    delete item.repo
    item.repos = item.repos || []
    item.repos.push(cur.repo)
    return item
  })

  console.log(
    columnify(
      topics.map((item) => displayRepos(item, showRepos)).sort(byKey('topic'))
    )
  )
}

const listTopics = async (config, filterOrgs) => {
  const organizations = []
  const fetchOrgs =
    filterOrgs.length > 0
      ? filterOrgs.map((org) => ({ name: org }))
      : config.organizations

  for (const organization of fetchOrgs) {
    let organizationRepositories = []
    infoMessage(chalk`{blue organization: } ${organization.name}`)
    organizationRepositories = await fetchTopics({
      ...organization,
      token: config.githubToken
    })
    organizations.push({
      organizationName: organization.name,
      repositories: organizationRepositories
    })
  }
  displayTopics(organizations, config)
}

export { listTopics }
