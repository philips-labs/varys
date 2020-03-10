const chalk = require('chalk')
const { graphql } = require('@octokit/graphql')
const inquirer = require('inquirer')
const { Octokit } = require('@octokit/rest')
const Slack = require('slack')

const {
  infoMessage,
  errorMessage
} = require('../logger/logger')

let token
let slackToken

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
  const { name, email, id } = organizationUser.user

  if (organizationUser.user.organization) {
    errorMessage(chalk`User (${user} / ${email} / ${name} / ${id}) is already part of Organization (${organization})`)
    process.exit(1)
  }
  infoMessage(chalk`User (${user} / ${email} / ${name} / ${id}) is known and NOT yet member of Organization (${organization}).`)
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

const processAction = async (username, organization) => {
  infoMessage(chalk`Add ${username} to ${organization}`)
  const octokit = new Octokit({
    auth: token
  })

  const { data } = await octokit.orgs.addOrUpdateMembership({
    org: organization,
    username: username,
    role: 'member'
  })
  infoMessage(chalk`Added ${username} to ${organization}`)

  const bot = new Slack(slackToken)
  var result = await bot.chat.postMessage({
    channel: '#royal-philips', 
    text: `Added *${username}* to *${organization}*`,
    token: slackToken}
  )
  console.log(data)
}

const addUser = async (config, { organization, user, team }) => {
  token = config.githubToken
  slackToken = config.slackToken

  team = team || ''
  infoMessage(chalk`Add User for: ${organization} / ${user} / ${team}`)

  checkOrganization(config, organization)
  userId = await checkUser(user, organization)
  checkTeam(team, organization)
  await verify()
  await processAction(user, organization)
}

module.exports = {
  addUser
}
