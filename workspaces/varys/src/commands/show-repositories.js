const chalk = require('chalk')
const { Octokit } = require('@octokit/rest')

const {
  infoMessage
} = require('../logger/logger')

const fetchRepositories = async ({ name }) => {
  const octokit = new Octokit()
  const { data } = await octokit.repos.listForOrg({
    org: name
  })
  const repositories = []
  for (const repository of data) {
    repositories.push(
      {
        name: name,
        repositoryName: repository.name,
        nodeId: repository.node_id,
        id: repository.id,
        url: repository.html_url,
        privateRepository: repository.private,
        stargazersCount: repository.stargazers_count,
        watchersCount: repository.watchers_count,
        forksCount: repository.forks_count,
        createdAt: repository.created_at,
        updatedAt: repository.updated_at,
        pushedAt: repository.pushed_at,
        archived: repository.archived
      }
    )
  }
  return repositories
}

const displayRepositories = (repositories) => {
  console.log(repositories)
}

const showRepositories = async (config) => {
  const repositories = []
  for (const organization of config.organizations) {
    let organizationRepositories = []
    infoMessage(chalk`{blue organization: } ${organization.name}`)
    organizationRepositories = await fetchRepositories(organization)
    repositories.push(organizationRepositories)
  }
  displayRepositories(repositories)
}

module.exports = {
  showRepositories
}
