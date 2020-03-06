const chalk = require('chalk')
const { graphql } = require('@octokit/graphql')

const {
  infoMessage
} = require('../logger/logger')

const addUser = async (config) => {
  infoMessage(chalk`add users implementation`)
}

module.exports = {
  addUser
}
