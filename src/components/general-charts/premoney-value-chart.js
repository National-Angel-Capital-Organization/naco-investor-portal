import React, { Component } from 'react'
import { Bar } from 'react-chartjs-2';
import axios from 'axios'
import axiosHeaders from '../../axios-headers'

export default class PremoneyValueChart extends Component {

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
          let sectors = [];
          res.data.Result.forEach(sector => {
            if (sector.Deal_MajorSector !== '' && sector.Deal_MajorSector !== 'Other') {
              sectors.push({ label: sector.Deal_MajorSector, sum: sector.PremoneyValueSum })
            }
          });

          // GET COUNT OF RECORDS WITH PREMONEY VALUES
          axios('/.netlify/functions/get', {
            method: 'GET',
            headers,
            params: { path: "rest/v2/tables/Deals/records", select: { 0: 'Deal_MajorSector', 1: 'COUNT(Deal_DealRef)%20AS%20PremoneyValueCount' }, where: { Group_NameAndSubmissionYear: { query: '%252017%25', type: '%20LIKE%20' }, Deal_PremoneyValue: { query: 'NULL', type: '%20IS%20NOT%20' } }, groupBy: 'Deal_MajorSector' }
          }
          )
            .then(res => {
              res.data.Result.forEach(count => {
                sectors.forEach(sector => {
                  if (count.Deal_MajorSector === sector.label) {
                    sector.count = count.PremoneyValueCount
                  }
                })
              });
              let premoneyValueLabels = []
              let premoneyValueAverage = []
              sectors.forEach(sector => {
                //SET STATE WITH LIST OF LABELS
                premoneyValueLabels.push(sector.label)
                //SET STATE WITH AVERAGE OF PREMONEY VALUE
                premoneyValueAverage.push(Math.round(sector.sum / sector.count))
              })
              this.setState({ premoneyValueLabels: premoneyValueLabels })
              this.setState({ premoneyValueData: premoneyValueAverage })
            })
            .catch(error => {
              throw error;
            })
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
    const data = {
      labels: this.state.premoneyValueLabels,
      datasets: [{
        label: 'Valuation ($)',
        data: this.state.premoneyValueData,
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

    const options = {
      scales: {
        yAxes: [
          {
            ticks: {
              callback: function (label, index, labels) {
                return label / 1000000 + 'm';
              }
            },
            scaleLabel: {
              display: true,
              labelString: '1m = $1,000,000'
            }
          }
        ]
      }
    }

    return (
      <Bar
        data={data}
        width={100}
        height={50}
        options={options}
      />
    )
  }

}