import chalk from 'chalk'
import columnify from 'columnify'

import { infoMessage } from '../logger'
import { withAuth } from '../graphql'

const fetchUsers = async ({ name, token }) => {
  const graphqlWithAuth = withAuth(token)

  const query = `
      query organizationRepositories($owner: String!) {
        organization(login:$owner) {
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
    const { samlIdentityProvider } = org.users.organization
    samlIdentityProvider.externalIdentities.edges.map(node => {
      console.log(node)
    })
    return {
      organisation: org.organizationName,
      code1: samlIdentityProvider.externalIdentities.edges
    }
  })
}

const showUsersCode1 = async (config, filterOrgs) => {
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

export { showUsersCode1 }
