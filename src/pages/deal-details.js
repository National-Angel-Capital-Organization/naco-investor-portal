import React, { Component } from 'react'
import axios from 'axios'
import Link from 'gatsby-link'
import axiosHeaders from '../axios-headers'


export default class DealDetails extends Component {

state = {
  deal: []
}

  componentDidMount() {

    let params = {}

    if (this.props.location.search) {
    let paramString = this.props.location.search
    paramString = paramString.substr(1)
    paramString = paramString.split("?")
    for (let param of paramString) {
      let paramList = param.split("=")
      params[paramList[0]] = paramList[1]
    }
  }

    // GET DEAL DETAILS

    axiosHeaders.generateHeaders().then((headers) => {
      axios('/.netlify/functions/get', {
        method: 'GET',
        headers,
        params: { path: `rest/v2/tables/IndvInvestorDeals/records`, userSpecific: true, IndvInvestor_GUID: params.IndvInvestor_GUID }
      }
      )
        .then(res => {
          this.setState({ IndvInvestor_GUID: res.data.Result })
          console.log(this.state)
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
        <h1>Your Deal Details</h1>
        <p>Update the details of your investment using the fields below.</p>
      </div>
    )
  }
}