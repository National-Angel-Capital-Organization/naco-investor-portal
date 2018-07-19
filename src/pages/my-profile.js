import React, { Component } from 'react'
import axios from 'axios'
import axiosHeaders from '../axios-headers'


export default class MyProfile extends Component {

  componentDidMount() {
    axiosHeaders.generateHeaders().then((headers) => {
      axios('/.netlify/functions/general-dashboard', {
        method: 'GET',
        headers
      }
      )
        .then(res => {
          console.log(res)
        })
        .catch(error => {
          throw error
        })
    })
      .catch(error => {
        console.log(error)
      })
  }

  render() {
    return (
      <div>
        <h1>Profile</h1>
        <p>Update your profile using the fields below.</p>
      </div>
    )
  }
}