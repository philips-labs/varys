import chalk from 'chalk'
import inquirer from 'inquirer'
import { Octokit } from '@octokit/rest'
import Slack from 'slack'

import { withAuth } from '../graphql'
import { infoMessage, errorMessage } from '../logger'

let token
let slackToken
let slackChannel

const checkOrganization = ({ organizations }, organization) => {
  for (const ourOrganization of organizations) {
    if (ourOrganization.name === organization) {
      infoMessage(
        chalk`Organization (${chalk.green(
          organization
        )}) is part of our organizations!`
      )
      return ourOrganization.team || ''
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

const getUserId = async (username) => {
  const octokit = new Octokit({
    auth: token
  })

  // Get userId from username
  let userData = await octokit.users.getByUsername({
      username
  });

  userData = userData.data
  return userData.id
}

const getTeamId = async (team, organization) => {
  const octokit = new Octokit({
    auth: token
  })

  let teamData
  try {
    teamData = await octokit.teams.getByName({
      org: organization,
      team_slug: team,
    });
  } catch (error) {
    console.log(error.message)
    errorMessage(chalk`Team ${chalk.yellow(team)} is unknown.`)
    process.exit(1)
  }

  if (teamData && teamData.data) {
    return teamData.data.id
  } else {
    errorMessage(chalk`Team ${chalk.yellow(team)} is unknown.`)
    process.exit(1)
  }
}

const inviteUser = async (username, organization, team, email) => {
  infoMessage(
    chalk`Add ${chalk.yellow(username)} to ${chalk.green(organization)}`
  )

  let payload = {
    org: organization,
    role: 'direct_member'
  }

  if (!email) {
    payload = {
      ...payload,
      invitee_id: await getUserId(username)
    }
  } else {
    infoMessage(
      chalk`Add user with email: ${chalk.yellow(username)}`
    )
    payload = {
      ...payload,
      email: username
    }
  }

  if (team != '') {
    infoMessage(
      chalk`Add default team: ${chalk.yellow(team)}`
    )

    payload = {
      ...payload,
      team_ids: [await getTeamId(team, organization)]
    }
  } else {
    infoMessage(
      chalk`No default team`
    )
  }

  const octokit = new Octokit({
    auth: token
  })

  const { data } = await octokit.orgs.createInvitation(payload)

  infoMessage(
    chalk`Added ${chalk.yellow(username)} to ${chalk.green(organization)}`
  )

  if (!slackToken || !slackChannel) {
    infoMessage(chalk`Missing mandatory slack parameters so no slack message today!`)
  } else {
    const bot = new Slack(slackToken)
    await bot.chat.postMessage({
      channel: slackChannel,
      text: `Added *${username}* to *${organization}*`,
      token: slackToken
    })
  }
  console.log(data)
}

const addUsers = async (config, { organization, users, email }) => {
  token = config.githubToken
  slackToken = config.slackToken
  slackChannel = config.slackChannel

  users.forEach(async user => {
    const team = checkOrganization(config, organization)

    infoMessage(
      chalk`Add user for: ${chalk.green(organization)} / ${chalk.yellow(
        user
      )} / ${chalk.yellow(team)}`
    )

    if (!email) {
      await checkUser(user, organization)
      await checkAlreadyInvited(user, organization)
      await checkBlocked(user, organization)
    } else {
      infoMessage(chalk`You're using an email address, so no additional checks are performed`)
    }
    await verify()
    await inviteUser(user, organization, team, email)
  })
}

export { addUsers }
