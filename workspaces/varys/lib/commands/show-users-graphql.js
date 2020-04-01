const chalk = require('chalk')
const columnify = require('columnify')

const { infoMessage } = require('../logger')

const fetchUsers = async ({ name, token }) => {
  const graphqlWithAuth = withAuth(token)

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

const display = organizations => {
  const data = organizations.map(org => {
    const { pendingMembers, membersWithRole } = org.users.organization
    return {
      organisation: org.organizationName,
      get total() {
        return this.assignedUsers + this.pendingUsers
      },
      assignedUsers: membersWithRole.totalCount,
      pendingUsers: pendingMembers.totalCount
    }
  })

  console.log(columnify(data))
}

const showUsers = async (config, filterOrgs) => {
  const organizations = []
  const fetchOrgs =
    filterOrgs.length > 0
      ? filterOrgs.map(org => ({ name: org }))
      : config.organizations

  for (const organization of fetchOrgs) {
    let organizationUsers = []
    infoMessage(chalk`{blue organization: } ${organization.name}`)
    organizationUsers = await fetchUsers({
      ...organization,
      token: config.githubToken
    })
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
