module.exports = {
  projects: [
    'workspaces/confluenza',
    {
      testMatch: ['<rootDir>/dummy']
    }
  ],
  collectCoverage: true,
  collectCoverageFrom: ['source/**.js', '!**/*.test.js', '!**/node_modules/**'],
  coverageReporters: ['text-summary', 'lcov']
}
