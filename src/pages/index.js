import React, { Component } from 'react'
import Link from 'gatsby-link'
import axios from 'axios'
import Cookies from 'js-cookie'


export default class IndexPage extends Component {

state = {
  deals: []
}

   componentDidMount() {
     axios
       .get(
         `https://${process.env.API_INTEGRATION_URL}.caspio.com/rest/v2/tables/Deals/records`,
         {
           headers: {
             accept: 'application/json',
             Authorization: `bearer ${Cookies.get('token')}`,
           },

         }
       )
       .then(res => {
         this.setState({ deals: res.data.Result })
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