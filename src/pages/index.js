import React, { Component } from 'react'
import axios from 'axios'
import axiosHeaders from '../axios-headers'
import PremoneyValueChart from '../components/premoney-value-chart'

export default class IndexPage extends Component {

  state = {
    premoneyValueLabels: [],
    premoneyValueData: []
  }



  componentDidMount() {

    // GET SUM OF PREMONEY VALUE

    axiosHeaders.generateHeaders().then((headers) => {
      axios('/.netlify/functions/get', {
        method: 'GET',
        headers,
        params: { path: "rest/v2/tables/Deals/records", select: { 0: 'Deal_MajorSector', 1: 'SUM(Deal_PremoneyValue)%20AS%20PremoneyValueSum' }, where: { Group_NameAndSubmissionYear: { query: '%252017%25', type: '%20LIKE%20' } }, groupBy: 'Deal_MajorSector' }
      }
      )
        .then(res => {
          let labels = [];
          let sums = [];
          res.data.Result.forEach(sum => {

            if (sum.Deal_MajorSector !== '' && sum.Deal_MajorSector !== 'Other') {
              labels.push(sum.Deal_MajorSector)
              sums.push(sum.PremoneyValueSum)   
            }
          });
          this.setState({premoneyValueLabels: labels})
          this.setState({premoneyValueData: sums})
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
        <h1>General Dashboard</h1>
        <p>Here you can find general investment information.</p>
        <PremoneyValueChart labels={this.state.premoneyValueLabels} data={this.state.premoneyValueData} />
      </div>
    )
  }
}