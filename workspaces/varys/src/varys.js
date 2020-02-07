#! /usr/bin/env node

const program = require('commander')
const chalk = require('chalk')
const fs = require('fs-extra')

const { showRepositories } = require('./commands/show-repositories')

const defaultConfigFileName = 'organizations.json'

const {
  setVerbose,
  infoMessage,
  errorMessage
} = require('./logger/logger')

program
  .version('0.0.1', '-v, --version')
  //.option('-c, --config <file>', 'set config path. defaults to organizations.json');


const config = require(`../${defaultConfigFileName}`);

program
  .command('show-repositories')
  .alias('sr')
  .description('Lord Varys knows everything....about repositories')
  .action(function(env) {
    infoMessage(chalk`show repositories`);
    showRepositories(config);
  });

program.parse(process.argv)

const { input, output, verbose } = program

const areCliInputParametersValid = ({ input, output }) => {
  if (!input) {
    errorMessage(chalk`{red Mandatory input parameter is missing} (run 'extract --help' for usage).`)
    return false
  }
}
