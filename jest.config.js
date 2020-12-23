module.exports = {
  projects: [
    'workspaces/varys',
    {
      testMatch: ['<rootDir>/dummy']
    }
  ],
  collectCoverage: true,
  collectCoverageFrom: ['lib/**.js', 'source/**.js', '!**/*.test.js', '!**/node_modules/**', '!**/bin/**'],
  coverageReporters: ['text-summary', 'lcov']
}
