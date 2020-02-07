#! /usr/bin/env node

const program = require('commander')
const chalk = require('chalk')
const fs = require('fs-extra')

const {
  setVerbose,
  infoMessage,
  errorMessage
} = require('./logger/logger')

program
  .version('0.0.1', '-v, --version')
  .parse(process.argv)

const { input, output, verbose } = program

const areCliInputParametersValid = ({ input, output }) => {
  if (!input) {
    errorMessage(chalk`{red Mandatory input parameter is missing} (run 'extract --help' for usage).`)
    return false
  }
}
