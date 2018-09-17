import React, { Component } from 'react'
import PropTypes from 'prop-types'
import Helmet from 'react-helmet'
import axios from 'axios'
import Header from '../components/header'
import './scss/index.scss'
import Cookies from 'js-cookie'
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider'
import getMuiTheme from 'material-ui/styles/getMuiTheme'
import netlifyIdentity from 'netlify-identity-widget'
import axiosHeaders from '../axios-headers'
import { Link } from 'react-router-dom';
import { library } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChartBar, faChartPie } from '@fortawesome/free-solid-svg-icons'
import Registration from '../components/registration';

library.add(faChartBar, faChartPie)



const muiTheme = getMuiTheme({
  palette: {
    textColor: '#525252',
    primary1Color: '#0079c1',
    primary2Color: '#54bceb',
    accent1Color: '#002f65',
    accent2Color: '#e0edf8',
    pickerHeaderColor: '#0079c1'
  },
})




export default class Layout extends Component {
  static propTypes = { children: PropTypes.func }

  state = {
    tokenCookie: false,
    validToken: false,
    loggedIn: false,
    loading: true,
    registered: false
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
      const registered = this.registrationStatus()
      console.log('inside component mount registered: ', registered)
      if (registered) {
        this.setState({registered: true})
      }
      this.setState({ loggedIn: true })
      this.setState({ loading: false })
    } else {
      this.setState({ loggedIn: false })
      this.setState({ loading: false })
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

  registrationStatus = () => {
    if (process.env.NODE_ENV === 'development') {
      return true
    } else {
    axiosHeaders.generateHeaders().then((headers) => {
      axios('/.netlify/functions/registration-status', {
        method: 'GET',
        headers,
        credentials: "include"
      }
      )
        .then((res) => {
          console.log('inside registrationStatus: ', res.data)
          return res.data
        })

        .catch(error => {
          throw error
        })
    })
      .catch(error => {
        console.log(error)
      })
    }
  }


  handleLogIn() {
    netlifyIdentity.open()
  }

  handleRegistration = () => {
    this.setState({ registered: true })
  }

  loggedIn = () => {
    const { data, children, siteTitle } = this.props
    if (this.state.loading) {
      return (<div>Loading</div>)
    }
    else if (this.state.loggedIn) {
      if (this.state.registered) {
        return (<div>
          <Header siteTitle={data.site.siteMetadata.title} />
          <div className="body-wrapper">{children()}</div>
        </div>)
      } else {
        return (
          <div>
            <div id="header">
              <div id="header-img">
                <img alt={this.props.siteTitle} src="https://d3lut3gzcpx87s.cloudfront.net/image_encoded/aHR0cHM6Ly9zaWxrc3RhcnQuczMuYW1hem9uYXdzLmNvbS8yMzUxYjhkZC05NzRiLTE3OGQtODc3Ny0wYmM0ZTQ5Y2M3NTMucG5n/540x100fPNG" />
              </div>
            </div>
            <div className="body-wrapper">
              <Registration siteTitle={siteTitle} id="header" handleRegistration={this.handleRegistration} />
            </div>
          </div>
        );
      }
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
