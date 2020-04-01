const chalk = require('chalk')
const { graphql } = require('@octokit/graphql')
const inquirer = require('inquirer')
const { Octokit } = require('@octokit/rest')
const Slack = require('slack')

const { infoMessage, errorMessage } = require('../logger')

let token
let slackToken

const checkOrganization = ({ organizations }, organization) => {
  for (const ourOrganization of organizations) {
    if (ourOrganization.name === organization) {
      infoMessage(
        chalk`Organization (${chalk.green(
          organization
        )}) is part of our organizations!`
      )
      return
    }
  }
  errorMessage(
    chalk`Organization (${chalk.green(
      organization
    )}) is not part of our organizations`
  )
  process.exit(1)
}

const fetchUser = async (name, organization) => {
  const graphqlWithAuth = withAuth(token)

  const query = `
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
    return await graphqlWithAuth(query, {
      user: name,
      organization: organization
    })
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
    errorMessage(
      chalk`User (${chalk.yellow(user)} / ${chalk.yellow(
        email
      )} / ${chalk.yellow(name)} / ${chalk.yellow(
        id
      )}) is already part of Organization (${chalk.green(organization)})`
    )
    process.exit(1)
  }
  infoMessage(
    chalk`User (${chalk.yellow(user)} / ${chalk.yellow(email)} / ${chalk.yellow(
      name
    )} / ${chalk.yellow(
      id
    )}) is known and NOT yet member of Organization (${chalk.green(
      organization
    )}).`
  )
}

const checkAlreadyInvited = async (username, organization) => {
  const octokit = new Octokit({
    auth: token
  })

  const { data } = await octokit.orgs.listPendingInvitations({
    org: organization
  })
  infoMessage(
    chalk`${chalk.yellow(data.length)} users are invited to ${chalk.green(
      organization
    )}`
  )

  if (data.length > 0) {
    const invitedMember = data.filter(
      invitedMember => invitedMember.login === username
    )
    if (invitedMember.length > 0) {
      errorMessage(
        chalk`${chalk.yellow(username)} is already invited to ${chalk.green(
          organization
        )} by ${chalk.yellow(invitedMember[0].inviter.login)} on ${chalk.yellow(
          invitedMember[0].created_at
        )}`
      )
      process.exit(1)
    } else {
      infoMessage(
        chalk`${chalk.green(username)} is not yet invited to ${chalk.green(
          organization
        )}`
      )
    }
  }
}

const checkBlocked = async (username, organization) => {
  infoMessage(chalk`checkBlocked not implemented yet`)

  // const { data } = await octokit.orgs.checkBlockedUser({
  //  org: organization,
  //  username: username
  // });
  // console.log(data)
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
  infoMessage(
    chalk`Add ${chalk.yellow(username)} to ${chalk.green(organization)}`
  )
  const octokit = new Octokit({
    auth: token
  })

  const { data } = await octokit.orgs.addOrUpdateMembership({
    org: organization,
    username: username,
    role: 'member'
  })
  infoMessage(
    chalk`Added ${chalk.yellow(username)} to ${chalk.green(organization)}`
  )

  const bot = new Slack(slackToken)
  await bot.chat.postMessage({
    channel: '#royal-philips',
    text: `Added *${username}* to *${organization}*`,
    token: slackToken
  })
  console.log(data)
}

const addUsers = async (config, { organization, users, team }) => {
  token = config.githubToken
  slackToken = config.slackToken

  team = team || ''

  users.forEach(async user => {
    infoMessage(
      chalk`Add user for: ${chalk.green(organization)} / ${chalk.yellow(
        user
      )} / ${chalk.yellow(team)}`
    )

    checkOrganization(config, organization)
    await checkUser(user, organization)
    await checkAlreadyInvited(user, organization)
    await checkBlocked(user, organization)
    checkTeam(team, organization)
    await verify()
    await processAction(user, organization)
  })
}

module.exports = {
  addUsers
}
