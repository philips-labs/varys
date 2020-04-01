module.exports = {
  ...require('./add-user-graphql'),
  ...require('./show-users-graphql'),
  ...require('./show-repositories-graphql'),
  ...require('./branch-protection-graphql')
}
