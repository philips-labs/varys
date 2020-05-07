import { withAuth } from '../graphql'

const getBranchProtectionQuery = `
  query GetBranchProtection($owner: String!, $repository: String!) {
    repository(owner: $owner, name: $repository) {
      id
      name
      branchProtectionRules(first: 20) {
        nodes {
          id
          pattern
          requiresApprovingReviews
          requiresCommitSignatures
        }
      }
    }
  }`

const branchProtectionMutation = mutation => `
  mutation ${mutation}BranchProtectionRule($input: ${mutation}BranchProtectionRuleInput!){
    ${mutation.toLowerCase()}BranchProtectionRule(input: $input) {
      branchProtectionRule {
        id
        repository {
          name
        }
        requiresCommitSignatures
        requiresApprovingReviews
      }
      clientMutationId
    }
  }`

const branchProtectionSettings = {
  requiresApprovingReviews: true,
  requiresCommitSignatures: true
}

const getBranchProtection = (token, owner, repository) =>
  withAuth(token)(getBranchProtectionQuery, {
    owner,
    repository
  })

const createBranchProtection = (token, repositoryId, settings) =>
  withAuth(token)(branchProtectionMutation('Create'), {
    input: {
      repositoryId,
      ...settings
    }
  })

const updateBranchProtection = (token, branchProtectionRuleId, settings) =>
  withAuth(token)(branchProtectionMutation('Update'), {
    input: {
      branchProtectionRuleId,
      ...settings
    }
  })

const getRule = (branchProtection, pattern) =>
  branchProtection.repository.branchProtectionRules.nodes.find(
    rule => rule.pattern === pattern
  )

const setBranchProtection = async (
  config,
  { owner, repository, branchPattern }
) => {
  try {
    const token = config.githubToken
    const branchProtection = await getBranchProtection(token, owner, repository)

    const rule = getRule(branchProtection, branchPattern)
    if (rule) {
      return await updateBranchProtection(
        token,
        rule.id,
        branchProtectionSettings
      )
    } else {
      return await createBranchProtection(
        token,
        branchProtection.repository.id,
        {
          pattern: branchPattern,
          ...branchProtectionSettings
        }
      )
    }
  } catch (error) {
    console.error(error)
  }
}

export { setBranchProtection }
