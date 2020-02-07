module.exports = {
  siteMetadata: {
    title: 'Varys',
    editBaseUrl: 'https://github.com/philips-internal/varys/blob/master'
  },
  plugins: [
    {
      resolve: '@confluenza/gatsby-theme-confluenza',
      options: {
        mdx: true
      }
    },
    'gatsby-plugin-emotion',
    'gatsby-plugin-catch-links',
    'gatsby-plugin-root-import'
  ]
}
