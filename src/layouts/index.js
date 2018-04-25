import React, { Component } from 'react'
import PropTypes from 'prop-types'
import Helmet from 'react-helmet'
import axios from 'axios'
import Header from '../components/header'
import './scss/index.scss'
import Cookies from 'js-cookie'
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider'
import getMuiTheme from 'material-ui/styles/getMuiTheme'

const muiTheme = getMuiTheme({
  palette: {
    textColor: '#525252',
    primary1Color: '#0079c1',
    primary2Color: '#54bceb',
    accent1Color: '#002f65',
    accent2Color: '#f78e23',
  },
});


export default class Layout extends Component {
  static propTypes = {
    children: PropTypes.func,
  }

  render() {
    const { data, children } = this.props;
    return (
      <MuiThemeProvider muiTheme={muiTheme}>
        <div>
          <Helmet
            title={data.site.siteMetadata.title}
            meta={[
              { name: 'description', content: 'Sample' },
              { name: 'keywords', content: 'sample, something' },
            ]}
          />
          <Header siteTitle={data.site.siteMetadata.title} />
          <div className="body-wrapper">
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
