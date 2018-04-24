import React, { Component } from 'react'
import PropTypes from 'prop-types'
import Helmet from 'react-helmet'
import axios from 'axios'
import Header from '../components/header'
import './index.css'
import Cookies from 'js-cookie'
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider'


export default class Layout extends Component {
  static propTypes = {
    children: PropTypes.func,
  }

  render() {
    const { data, children } = this.props;
    return (
      <MuiThemeProvider>
        <div>
          <Helmet
            title={data.site.siteMetadata.title}
            meta={[
              { name: 'description', content: 'Sample' },
              { name: 'keywords', content: 'sample, something' },
            ]}
          />
          <Header siteTitle={data.site.siteMetadata.title} />
          <div
            style={{
              margin: '0 auto',
              maxWidth: 960,
              padding: '0px 1.0875rem 1.45rem',
              paddingTop: 0,
            }}
          >
            {children()}
          </div>
        </div>
      </MuiThemeProvider>
    )
  }
}

export const query = graphql`
  query SiteTitleQuery {
    site {
      siteMetadata {
        title
      }
    }
  }
`
