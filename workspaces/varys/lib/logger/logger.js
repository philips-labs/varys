const chalk = require('chalk')

let verbose = false

const setVerbose = (newVerboseValue) => {
  verbose = newVerboseValue
}

const infoMessage = (message, verboseMessage) => {
  console.log(chalk`{green v} ${message}`)
  if (verbose && verboseMessage) {
    console.log(`   Additional info: ${verboseMessage}`)
  }
}

const errorMessage = (message, verboseMessage) => {
  console.error(chalk`{red x} ${message}`)

  if (verbose && verboseMessage) {
    console.error(`   Additional info: ${verboseMessage}`)
  }
}

const warningMessage = (message, verboseMessage) => {
  console.warn(chalk`{yellow !} ${message}`)

  if (verbose && verboseMessage) {
    console.warn(`    Additional info: ${verboseMessage}`)
  }
}

module.exports = {
  setVerbose,
  infoMessage,
  warningMessage,
  errorMessage
}
