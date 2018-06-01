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
import axiosHeaders from '../axios-headers'
import { Link } from 'react-router-dom';



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
    tokenCookie: false,
    validToken: false,
    loggedIn: false,
  }

  checkForToken() {
    if (!Cookies.get('token')) {
      this.setState({ tokenCookie: false })
      this.getToken()
    } else {
      this.setState({ tokenCookie: true })
    }
  }

  componentWillMount() {
    this.checkForToken()
  }

  componentDidMount() {
    netlifyIdentity.init();
    const user = netlifyIdentity.currentUser();
    if (user) {
      this.setState({ loggedIn: true })
    } else {
      this.setState({ loggedIn: false })
    }
    netlifyIdentity.on("login", (user) => {
      netlifyIdentity.close()
      this.setState({ loggedIn: true })
    });
    netlifyIdentity.on("logout", (user) => {
      netlifyIdentity.close()
      this.setState({ loggedIn: false })
    });
    if (this.state.tokenCookie) {
      axiosHeaders.generateHeaders().then((headers) => {
        axios.get('/.netlify/functions/check-token',
          headers
        )
          .then(res => {
            this.setState({ validToken: true })
          })
          .catch(error => {
            if (error.response.status === 401) {
              this.getToken()
            } else {
              this.setState({ validToken: false })
              console.log(error)
            }
          })
      })
        .catch(error => {
          throw error
        })
    } else {
      this.getToken()
    }
  }

  getToken = () => {
    const headers = { "Content-Type": "application/json" };
    axios.get('/.netlify/functions/get-token',
      headers
    )
      .then(res => {
        Cookies.set('token', res.data, { expires: 1 })
        this.setState({ validToken: true })
      })
      .catch(error => {
        this.setState({ validToken: false })
        console.log(error)
      })
  }

  handleLogIn() {
    // You can import the widget into any component and interact with it.
    netlifyIdentity.open()
  }

  loggedIn = () => {
    const { data, children } = this.props
    if (this.state.loggedIn) {
      return (<div>
        <Header siteTitle={data.site.siteMetadata.title} />
        <div className="body-wrapper">{children()}</div>
        </div>);
    } else {
      return (<div>
        <button onClick={this.handleLogIn} >Log In</button>
      </div>);
    }
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

          {this.loggedIn()}
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
