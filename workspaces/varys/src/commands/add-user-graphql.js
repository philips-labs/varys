const chalk = require('chalk')
const { graphql } = require('@octokit/graphql')

const {
  infoMessage,
  errorMessage
} = require('../logger/logger')

let token
let userId

const checkOrganization = ({organizations}, organization) => {
  for (const ourOrganization of organizations) {
    if (ourOrganization.name === organization) {
      infoMessage(chalk`Organization (${organization}) is part of our organizations!`)
      return
    }
  }
  errorMessage(chalk`Organization (${organization}) is not part of our organizations`)
  process.exit(1)
}

const fetchUser = async ( name, organization ) => {
  const graphqlWithAuth = graphql.defaults({
    headers: {
      authorization: `token ${token}`
    }
  })

  const query =
    `
      query userOrganization($user: String!, $organization: String!) {
        user(login:$user) {
          id
          name
          email
          organization(login:$organization) {
            name
          }
        }
      }
    `

  try {
    return await graphqlWithAuth(query, { user: name, organization: organization })
  } catch (error) {
    console.log(error.message)
    errorMessage(chalk`User is not known in GitHub`)
    process.exit(1)
  }
}

const checkUser = async (user, organization) => {
  organizationUser = await fetchUser(user, organization)
  const {name, email} = organizationUser.user
  userId = organizationUser.user.id

  if (organizationUser.user.organization) {
    errorMessage(chalk`User (${user} / ${email} / ${name} / #{userId}) is already part of Organization (${organization})`)
    process.exit(1)
  }
  infoMessage(chalk`User (${user} / ${email} / ${name} / ${userId}) is known and NOT yet member of Organization (${organization}).`)
}

const checkTeam = async (team, organization) => {
  infoMessage(chalk`Team not implemented yet`)
}

const addUser = async (config, {organization, user, team}) => {
  token = config.githubToken
  team = team || ""
  infoMessage(chalk`Add User for: ${organization} / ${user} / ${team}`)

  checkOrganization(config, organization)
  await checkUser(user, organization)
  checkTeam(team, organization)
}

module.exports = {
  addUser
}
