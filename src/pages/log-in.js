import React, { Component } from 'react'
import Link from 'gatsby-link'

export default class LogIn extends Component {

  render() {
    return (
      <div>
        <h1>Log In</h1>
        <Link to="/forgot-password">Forgot Password?</Link>
      </div>
    )
  }
}