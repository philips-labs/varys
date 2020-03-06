#! /usr/bin/env node

const program = require('commander')
const chalk = require('chalk')

const { showRepositories } = require('./commands/show-repositories-graphql')

const defaultConfigFileName = 'organizations.json'

const {
  infoMessage
} = require('./logger/logger')

program
  .version('0.0.1', '-v, --version')
  // .option('-c, --config <file>', 'set config path. defaults to organizations.json');

const config = require(`../${defaultConfigFileName}`)

program
  .command('show-repositories')
  .alias('sr')
  .description('Lord Varys knows everything....about repositories')
  .action(function (env) {
    infoMessage(chalk`show repositories`)
    showRepositories(config)
  })

program.parse(process.argv)
