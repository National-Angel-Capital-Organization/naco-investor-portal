import React, { Component } from 'react'
import axios from 'axios'
import axiosHeaders from '../axios-headers'
import { Bar } from 'react-chartjs-2';




export default class IndexPage extends Component {

  state = {
    data: {
      labels: [],
      datasets: [{
        label: 'Valuation ($)',
        data: [0, 0, 3, 0, 0, 0],
        backgroundColor: [
          'rgba(255, 99, 132, 0.2)',
          'rgba(54, 162, 235, 0.2)',
          'rgba(255, 206, 86, 0.2)',
          'rgba(75, 192, 192, 0.2)',
          'rgba(153, 102, 255, 0.2)',
          'rgba(255, 159, 64, 0.2)'
        ],
        borderColor: [
          'rgba(255,99,132,1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
          'rgba(255, 159, 64, 1)'
        ],
        borderWidth: 1
      }]
    }
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
          const oldState = this.state;
          let newState = oldState;
          newState.data.labels = labels;
          newState.data.datasets[0].data = sums;
          this.setState(newState)
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
        <Bar 
          data={this.state.data}
          width={100}
          height={50} 
        />

      </div>
    )
  }
}