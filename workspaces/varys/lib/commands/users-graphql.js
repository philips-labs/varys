import chalk from 'chalk'
import columnify from 'columnify'

import { infoMessage } from '../logger'
import { withAuth } from '../graphql'
import { byKeys } from '../data'
import { userLDAP } from '../ldap'

const queryByOwner = (select) => `
  query organizationRepositories($owner: String!) {
    organization(login:$owner) {
      ${select}
    }
  }`

const fetchUsers = async ({ enterprise, name, token, after }) => {
  const graphqlWithAuth = withAuth(token)

  const query = `query organizationRepositories($enterprise: String!, $owner: String!, $after: String) {
    enterprise(slug: $enterprise){
      ownerInfo {
        samlIdentityProvider {
          ssoUrl
          externalIdentities(first: 100, after: $after) {
            edges {
              node {
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
            pageInfo {
              hasNextPage
              endCursor
            }
          }
        }
      }
    }
  }`

  try {
    return await graphqlWithAuth(query, { enterprise, owner: name, after })
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

const flattenUserList = (enterprises) => {
  return enterprises.flatMap(
    (enterprise) =>
      enterprise.users.enterprise.ownerInfo.samlIdentityProvider &&
      enterprise.users.enterprise.ownerInfo.samlIdentityProvider.externalIdentities.edges.map(
        (edge) => ({
          organization:
            edge.node.user &&
            edge.node.user.organization &&
            edge.node.user.organization.name,
          userId: edge.node.user && edge.node.user.login,
          name: edge.node.user && edge.node.user.name,
          code1: edge.node.samlIdentity.nameId
        })
      )
  )
}

const addLDAPStatus = (userlist, config) => {
  return userlist.map(v => ({...v, ldap: userLDAP(v.code1, config)}))
}

const displayList = (organizations, config, options) => {
  let userlist = flattenUserList(organizations)
  if (options.ldap) {
    userlist = addLDAPStatus(userlist, config)
  }
  console.log(
    columnify(
      userlist
        .filter((item) => item.organization)
        .sort(byKeys('organization', 'userId')),
      {
        columns: ['userId', 'code1', 'ldap', 'organization', 'name']
      }
    )
  )
}

const organizations = []

const listUsersOnePage = async (config, organization, after) => {
  let organizationUsers = []
  organizationUsers = await fetchUsers({
    enterprise: config.enterprise,
    ...organization,
    token: config.githubToken,
    after: after
  })
  organizations.push({
    organizationName: organization.name,
    users: organizationUsers
  })

  const pageInfo =
    organizationUsers.enterprise.ownerInfo.samlIdentityProvider
      .externalIdentities.pageInfo
  return pageInfo.hasNextPage && pageInfo.endCursor
}

const listUsers = async (config, filterOrgs, options) => {
  const fetchOrgs =
    filterOrgs.length > 0
      ? filterOrgs.map((org) => ({ name: org }))
      : config.organizations

  for (let organization of fetchOrgs) {
    infoMessage(chalk`{blue organization: } ${organization.name}`)

    let after = null
    do {
      infoMessage('fetching a page..')
      after = await listUsersOnePage(config, organization, after)
    } while (after)
  }
  displayList(organizations, config, options)
}

export { showUserSummary, listUsers }
