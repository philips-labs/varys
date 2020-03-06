#! /usr/bin/env node

const program = require('commander')
const chalk = require('chalk')

const { showRepositories } = require('./commands/show-repositories-graphql')
const { showUsers } = require('./commands/show-users-graphql')
const { addUser } = require('./commands/add-user-graphql')

const defaultConfigFileName = 'organizations.json'

const {
  infoMessage,
  errorMessage
} = require('./logger/logger')

program
  .version('0.0.1', '-v, --version')
  // .option('-c, --config <file>', 'set config path. defaults to organizations.json');

const config = require(`../${defaultConfigFileName}`)

program
  .command('add-user')
  .alias('au')
  .description('Lord Varys can do anything....for societies')
  .option("-o, --organization <organization-name>", "To which organization")
  .option("-u, --user <user-name>", "Which user")
  .option("-t, --team <team-name>", "Which team (optional)")
  .action(function (options) {
    infoMessage(chalk`add user`)
    if (!options.organization || !options.user) { 
      errorMessage(chalk`missing parameter`)
      this.help() 
      return 1
    }
    const team = options.team || ""
    infoMessage(chalk`${options.organization} / ${options.user} / ${team}`)
    addUser(config)
  })

program
  .command('show-repositories')
  .alias('sr')
  .description('Lord Varys knows everything....about repositories')
  .action(function (env) {
    infoMessage(chalk`show repositories`)
    showRepositories(config)
  })

program
  .command('show-users')
  .alias('su')
  .description('Lord Varys knows everything....about users')
  .action(function (env) {
    infoMessage(chalk`show users`)
    showUsers(config)
  })

program.parse(process.argv)
