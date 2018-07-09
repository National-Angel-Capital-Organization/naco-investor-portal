import React, { Component } from 'react'
import { Bar } from 'react-chartjs-2';
import axios from 'axios'
import axiosHeaders from '../../axios-headers'

export default class TotalSectorDollarChart extends Component {

  state = {
    totalSectorDollarLabels: [],
    totalSectorDollarData: []
  }

  fetchData = (year) => {
    // GET INVESTMENT DOLLAR AMOUNTS

    axiosHeaders.generateHeaders().then((headers) => {
      axios('/.netlify/functions/get', {
        method: 'GET',
        headers,
        params: { path: "rest/v2/tables/Deals/records", select: { 0: 'Deal_MajorSector', 1: 'SUM(Deal_DollarInvested)%20AS%20totalSectorDollar' }, where: { Group_NameAndSubmissionYear: { query: year, type: '%20LIKE%20' } }, groupBy: 'Deal_MajorSector' }
      }
      )
        .then(res => {
          let sectors = [];
          res.data.Result.forEach(sector => {
            if (sector.Deal_MajorSector !== '' && sector.Deal_MajorSector !== 'Other') {
              sectors.push({ label: sector.Deal_MajorSector, totalSectorDollar: sector.totalSectorDollar, indvInvestorTotalSectorDollar: 0 })
            }
          });

          // GET DOLLAR AMOUNT OF DEALS FROM INDIVIDUAL INVESTORS
          axios('/.netlify/functions/get', {
            method: 'GET',
            headers,
            params: { path: "rest/v2/tables/IndvInvestorDeals/records", select: { 0: 'IndvInvestor_CompanyMajorSector', 1: 'SUM(IndvInvestor_DollarsInvested)%20AS%20indvInvestorTotalSectorDollar' }, where: { IndvInvestor_Email_Year: { query: year, type: '%20LIKE%20' } }, groupBy: 'IndvInvestor_CompanyMajorSector' }
          }
          )
            .then(res => {
              res.data.Result.forEach(indvInvestorSector => {
                sectors.forEach(sector => {
                  if (indvInvestorSector.IndvInvestor_CompanyMajorSector.toLowerCase() === sector.label.toLowerCase()) {
                    sector.indvInvestorTotalSectorDollar = indvInvestorSector.indvInvestorTotalSectorDollar
                  }
                })
              });
              let totalSectorDollarLabels = []
              let totalSectorDollarData = []
              sectors.forEach(sector => {
                //SET STATE WITH LIST OF LABELS
                totalSectorDollarLabels.push(sector.label)
                //SET STATE WITH SUM OF DEAL DOLLARS
                totalSectorDollarData.push(Math.round(sector.indvInvestorTotalSectorDollar + sector.totalSectorDollar))
              })
              this.setState({ totalSectorDollarLabels: totalSectorDollarLabels })
              this.setState({ totalSectorDollarData: totalSectorDollarData })
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

  componentDidMount() {
    this.fetchData('%25')

  }


  componentWillReceiveProps(newProps) {
    this.fetchData(newProps.year)
  }

  render() {
    const data = {
      labels: this.state.totalSectorDollarLabels,
      datasets: [{
        label: 'Total Sector ($)',
        data: this.state.totalSectorDollarData,
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