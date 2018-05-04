
var proxy = require("http-proxy-middleware");

module.exports = {
  siteMetadata: {
    title: 'NACO Investor Portal',
  },
  plugins: [
    'gatsby-plugin-react-helmet',
    `gatsby-plugin-sass`
  ],
  developMiddleware: app => {
    app.use(
      "/.netlify/functions/",
      proxy({
        target: "http://localhost:9000",
        pathRewrite: {
          "/.netlify/functions/": "",
        },
      })
    );
  },
}
