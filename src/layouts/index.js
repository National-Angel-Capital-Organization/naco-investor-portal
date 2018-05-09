import React, { Component } from 'react'
import PropTypes from 'prop-types'
import Helmet from 'react-helmet'
import axios from 'axios'
import { navigateTo } from "gatsby-link"
import Header from '../components/header'
import './scss/index.scss'
import Cookies from 'js-cookie'
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider'
import getMuiTheme from 'material-ui/styles/getMuiTheme'
import netlifyIdentity from 'netlify-identity-widget'




const muiTheme = getMuiTheme({
  palette: {
    textColor: '#525252',
    primary1Color: '#0079c1',
    primary2Color: '#54bceb',
    accent1Color: '#002f65',
    accent2Color: '#f78e23',
    pickerHeaderColor: '#0079c1'
  },
})




export default class Layout extends Component {
  static propTypes = { children: PropTypes.func }

  state = {
    apiToken: false
  }

  generateHeaders() {
    netlifyIdentity.init()
    const headers = { "Content-Type": "application/json" };

    if (netlifyIdentity.currentUser()) {
      return netlifyIdentity.currentUser().jwt().then((token) => {
        return { ...headers, "Authorization": `Bearer ${token}` };
      })
    }
    return Promise.resolve(headers);
  }

  checkForToken() {
    if (!Cookies.get('token')) {
      this.setState({apiToken: false})
      this.getToken()
    } else {
      this.generateHeaders().then((headers) => {
        axios.get('/.netlify/functions/check-token', 
          headers
        )
          .then(res => {
            console.log(res)
          })
          .catch(error => {
            console.log(error)
          })
      })
      .then(res => {
        console.log(res)
      })
        .catch(error => {
          if (error.response.status === 401) {
            this.getToken()
          } else {
            this.setState({apiToken: false})
            console.log(error)
          }
        })
    }
  }

  componentWillMount() {
    this.checkForToken()
  }

  componentDidMount() {
    netlifyIdentity.init();
  }

  getToken = () => {
    axios
      .post(
        `${process.env.API_AUTH_URL}`,
        `grant_type=client_credentials&client_id=${
          process.env.API_CLIENT_ID
        }&client_secret=${process.env.API_CLIENT_SECRET}`
      )
      .then(res => {
        Cookies.set('token', res.data.access_token, { expires: 1 })
        this.setState({apiToken: true})
      })
      .catch(error => {
        console.log(error)
      })
  }

  render() {

    const { data, children } = this.props
    return (
      <MuiThemeProvider muiTheme={muiTheme}>
        
        <div>

          <Helmet
            title={data.site.siteMetadata.title}
            meta={[
              { name: 'description', content: 'Sample' },
              { name: 'keywords', content: 'sample, something' },
            ]}>
            
            </Helmet>
          
          <Header siteTitle={data.site.siteMetadata.title} />
          <div className="body-wrapper">{children()}</div>
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
