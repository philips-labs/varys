const chalk = require('chalk')
const { graphql } = require('@octokit/graphql')

const { infoMessage } = require('../logger')

let token

const fetchUsers = async ({ name }) => {
  const graphqlWithAuth = graphql.defaults({
    headers: {
      authorization: `token ${token}`
    }
  })

  const query = `
      query organizationRepositories($owner: String!) {
        organization(login:$owner) {
          membersWithRole {
            totalCount
          }
          pendingMembers {
            totalCount
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
const displayUser = (organizationName, users) => {
  const assignedUsers = users.membersWithRole.totalCount
  const pendingUsers = users.pendingMembers.totalCount
  const total = assignedUsers + pendingUsers

  console.log(`${organizationName}|${total}|${assignedUsers}|${pendingUsers}`)
}

const display = async organizations => {
  console.log('Organization|# users|# assigned-users|# pending-users')
  for (const organization of organizations) {
    const users = await organization.users.organization
    displayUser(organization.organizationName, users)
  }
}

const showUsers = async config => {
  token = config.githubToken
  const organizations = []
  for (const organization of config.organizations) {
    let organizationUsers = []
    infoMessage(chalk`{blue organization: } ${organization.name}`)
    organizationUsers = await fetchUsers(organization)
    organizations.push({
      organizationName: organization.name,
      users: organizationUsers
    })
  }
  display(organizations)
}

module.exports = {
  showUsers
}
