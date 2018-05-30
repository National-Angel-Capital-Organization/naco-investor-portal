import React, { Component } from 'react'
import Link from 'gatsby-link'
import axios from 'axios'
import Cookies from 'js-cookie'
import getDataFunctions from '../get-data-functions'

export default class IndexPage extends Component {

state = {
  deals: []
}

   componentDidMount() {

     getDataFunctions.generateHeaders().then((headers) => {
       axios('/.netlify/functions/get', {
         method: 'GET',
         headers,
         params: { path: "rest/v2/tables/Deals/records" }
       }
       )
         .then(res => {
           this.setState({ deals: res.data.Result })
         })
         .catch(error => {
           throw error
         })
     })
       .catch(error => {
         console.log(error)
       })

     getDataFunctions.generateHeaders().then((headers) => {
       axios('/.netlify/functions/hello-world', { 
           method: 'GET',
           headers}
       )
       .then (res => {
         console.log(res)
       })
         .catch(error => {
           console.log(error)
         })
     })
       .catch(error => {
         console.log(error)
       })

   }

  render() {
    return (
      <div>
        <h1>General Dashboard</h1>
        <p>Here you can find general investment information.</p>
        <p>Deals: {this.state.deals.length}</p>

      </div>
    )
  }
}