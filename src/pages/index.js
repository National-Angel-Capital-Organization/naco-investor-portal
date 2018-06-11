import React, { Component } from 'react'
import Link from 'gatsby-link'
import axios from 'axios'
import Cookies from 'js-cookie'
import axiosHeaders from '../axios-headers'
import Chart from 'chart.js';



export default class IndexPage extends Component {

  state = {
    data: [12, 19, 3, 5, 2, 7],
    premoneyValue: {
      sum: {
        "Services": 0,
        "Manufacturing": 0,
        "Life Sciences": 0,
        "Energy": 0,
        "ICT": 0,
        "Clean Technologies": 0
      },
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
          console.log(res.data.Result)
          const sum = {}
          for (let sector of res.data.Result) {
            if (sector.Deal_MajorSector !== '' && sector.Deal_MajorSector !== 'Other') {
              sum[sector.Deal_MajorSector] = sector.PremoneyValueSum;
            }
          }
          const oldState = this.state;
          let newState = oldState;
          newState.premoneyValue.sum = sum;
          this.setState(newState)
        })
        .catch(error => {
          throw error
        })
    })
      .catch(error => {
        console.log(error)
      })




    Chart.defaults.scale.ticks.beginAtZero = true;
    const premoneyValue = document.getElementById("premoneyValue");

    var premoneyValueChart = new Chart(premoneyValue, {
      type: 'bar',
      data: {
        labels: Object.keys(this.state.premoneyValue.sum),
        datasets: [{
          label: 'Valuation ($)',
          data: this.state.data,
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
    });

  }

  render() {
    return (
      <div>
        <h1>General Dashboard</h1>
        <p>Here you can find general investment information.</p>
        <canvas id="premoneyValue" width="400" height="400"></canvas>

      </div>
    )
  }
}