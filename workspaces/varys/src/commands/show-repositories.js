const chalk = require('chalk')
const {
  infoMessage,
  errorMessage
} = require('../logger/logger')

const showRepositories = ( config ) => {
  config.organizations.forEach((organization) => {
    infoMessage(chalk`{blue organization: } ${organization.name}`)
  })
  errorMessage(chalk`{red Not implemented yet}: showRepositories`)
}

module.exports = {
  showRepositories
}
