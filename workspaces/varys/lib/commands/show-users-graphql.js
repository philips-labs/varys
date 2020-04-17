import chalk from 'chalk'
import columnify from 'columnify'

import { infoMessage } from '../logger'
import { withAuth } from '../graphql'

const queryByOwner = (select) => `
  query organizationRepositories($owner: String!) {
    organization(login:$owner) {
      ${select}
    }
  }`

const fetchUsers = async ({ name, token }) => {
  const graphqlWithAuth = withAuth(token)

  const query = queryByOwner(`
    samlIdentityProvider {
      ssoUrl
      externalIdentities(first: 100) {
        edges {
          node {
            samlIdentity {
              nameId
            }
            user {
              login
            }
          }
        }
      }
    }`)

  try {
    return await graphqlWithAuth(query, { owner: name })
  } catch (error) {
    console.log('Request failed:', error.request)
    console.log(error.message)
  }
}

const fetchSummary = async ({ name, token }) => {
  const graphqlWithAuth = withAuth(token)

  const query = queryByOwner(`
    membersWithRole {
      totalCount
    }
    pendingMembers {
      totalCount
    }`)

  try {
    return await graphqlWithAuth(query, { owner: name })
  } catch (error) {
    console.log('Request failed:', error.request)
    console.log(error.message)
  }
}

const display = (organizations) => {
  const data = organizations.map((org) => {
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

const showUserSummary = async (config, filterOrgs) => {
  const organizations = []
  const fetchOrgs =
    filterOrgs.length > 0
      ? filterOrgs.map((org) => ({ name: org }))
      : config.organizations

  for (const organization of fetchOrgs) {
    let organizationUsers = []
    infoMessage(chalk`{blue organization: } ${organization.name}`)
    organizationUsers = await fetchSummary({
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

const displayList = (organizations) => {
  const data = organizations.flatMap(
    (org) =>
      org.users.organization.samlIdentityProvider &&
      org.users.organization.samlIdentityProvider.externalIdentities.edges.map(
        (edge) => ({
          organisation: org.organizationName,
          userId: edge.node.user && edge.node.user.login,
          code1: edge.node.samlIdentity.nameId
        })
      )
  )
  console.log(columnify(data.filter(Boolean)))
}

const listUsers = async (config, filterOrgs) => {
  const organizations = []
  const fetchOrgs =
    filterOrgs.length > 0
      ? filterOrgs.map((org) => ({ name: org }))
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
  displayList(organizations)
}

export { showUserSummary, listUsers }
