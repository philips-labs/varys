module.exports = {
  projects: [
    'workspaces/varys',
    {
      testMatch: ['<rootDir>/dummy']
    }
  ],
  collectCoverage: true,
  collectCoverageFrom: ['source/**.js', '!**/*.test.js', '!**/node_modules/**'],
  coverageReporters: ['text-summary', 'lcov']
}
