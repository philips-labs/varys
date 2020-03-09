const chalk = require('chalk')
const { graphql } = require('@octokit/graphql')
const inquirer = require('inquirer')

const {
  infoMessage,
  errorMessage
} = require('../logger/logger')

let token
let userId

const checkOrganization = ({ organizations }, organization) => {
  for (const ourOrganization of organizations) {
    if (ourOrganization.name === organization) {
      infoMessage(chalk`Organization (${organization}) is part of our organizations!`)
      return
    }
  }
  errorMessage(chalk`Organization (${organization}) is not part of our organizations`)
  process.exit(1)
}

const fetchUser = async (name, organization) => {
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
  const organizationUser = await fetchUser(user, organization)
  const { name, email } = organizationUser.user
  userId = organizationUser.user.id

  if (organizationUser.user.organization) {
    errorMessage(chalk`User (${user} / ${email} / ${name} / #{userId}) is already part of Organization (${organization})`)
    process.exit(1)
  }
  infoMessage(chalk`User (${user} / ${email} / ${name} / ${userId}) is known and NOT yet member of Organization (${organization}).`)
}

const checkTeam = (team, organization) => {
  infoMessage(chalk`Team not implemented yet`)
}

const confirmAdd = () => {
  return {
    message: 'Do you want to proceed?',
    name: 'proceed',
    type: 'confirm',
    default: false
  }
}

const verify = async () => {
  const getConfirm = await inquirer.prompt(confirmAdd())
  if (getConfirm.proceed) {
    infoMessage(chalk`Confirmed`)
  } else {
    errorMessage(chalk`User cancelled operation.`)
    process.exit(1)
  }
}

const processAction = () => {
  infoMessage(chalk`process not implemented yet`)
}

const addUser = async (config, { organization, user, team }) => {
  token = config.githubToken
  team = team || ''
  infoMessage(chalk`Add User for: ${organization} / ${user} / ${team}`)

  checkOrganization(config, organization)
  await checkUser(user, organization)
  checkTeam(team, organization)
  await verify()
  processAction()
}

module.exports = {
  addUser
}
