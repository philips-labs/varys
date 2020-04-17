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

const fetchUsers = async ({ enterprise, name, token }) => {
  const graphqlWithAuth = withAuth(token)

  const query = `query organizationRepositories($enterprise: String!, $owner: String!) {
    enterprise(slug: $enterprise){
      ownerInfo {
        samlIdentityProvider {
          ssoUrl
          externalIdentities(first: 100) {
            nodes {
              samlIdentity {
                nameId
              }
              user {
                login
                name
                organization(login: $owner) {
                  name
                }
              }
            }
          }
        }
      }
    }
  }`

  try {
    return await graphqlWithAuth(query, { enterprise, owner: name })
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

const displayList = (enterprises) => {
  console.dir(
    enterprises[0].users.enterprise.ownerInfo.samlIdentityProvider
      .externalIdentities
  )
  console.dir(enterprises[0].users.enterprise)
  const data = enterprises.flatMap(
    (enterprise) =>
      enterprise.users.enterprise.ownerInfo.samlIdentityProvider &&
      enterprise.users.enterprise.ownerInfo.samlIdentityProvider.externalIdentities.nodes.map(
        (node) => ({
          organisation:
            node.user && node.user.organization && node.user.organization.name,
          userId: node.user && node.user.login,
          name: node.user && node.user.name,
          code1: node.samlIdentity.nameId
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
      enterprise: config.enterprise,
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
