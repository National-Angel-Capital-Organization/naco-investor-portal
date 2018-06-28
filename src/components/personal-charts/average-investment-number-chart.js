import React, { Component } from 'react'
import { Bar } from 'react-chartjs-2';
import axios from 'axios'
import axiosHeaders from '../../axios-headers'

export default class AverageInvestmentNumberChart extends Component {
  state = {
    averageInvestmentNumberLabels: [],
    averageInvestmentNumberData: []
  }

  fetchData = (year) => {
    // GET USER INVESTMENT NUMBER

    axiosHeaders.generateHeaders().then((headers) => {
      axios('/.netlify/functions/get', {
        method: 'GET',
        headers,
        params: {
          path: "rest/v2/tables/IndvInvestorDeals/records", select: { 0: 'COUNT(IndvInvestor_GUID)%20AS%20userInvestmentNumber' }, where: { userSpecific: true, IndvInvestor_Email_Year: { query: year, type: '%20LIKE%20' } }
        }
      })
        .then(res => {
          const personalNumber = res.data.Result[0]
          let averages = [];
          averages.push({ label: 'Your Number of Investments (#)', investmentNumber: personalNumber.userInvestmentNumber, })

          // GET NUMBER OF DEALS FROM OTHER INDIVIDUAL INVESTORS
          axios('/.netlify/functions/get', {
            method: 'GET',
            headers,
            params: { path: "rest/v2/tables/IndvInvestorDeals/records", select: { 0: 'COUNT(IndvInvestor_GUID)%20AS%20indvInvestorDealsNumber' }, where: { notUser: true, IndvInvestor_Email_Year: { query: year, type: '%20LIKE%20' } } }
          }
          )
            .then(res => {
              const indvInvestorDealsNumber = res.data.Result[0].indvInvestorDealsNumber

              // GET NUMBER OF INDIVIDUAL INVESTORS
              axios('/.netlify/functions/get', {
                method: 'GET',
                headers,
                params: { path: "rest/v2/tables/IndvInvestorDeals/records", select: { 0: 'COUNT(DISTINCT%20IndvInvestor_Email)%20AS%20indvInvestorsNumber' }, where: { notUser: true, IndvInvestor_Email_Year: { query: year, type: '%20LIKE%20' } } }
              }
              )
                .then(res => {
                  const indvInvestorsNumber = res.data.Result[0].indvInvestorsNumber
                  const dealsPerIndvInvestor = indvInvestorDealsNumber / indvInvestorsNumber

                  averages.push({ label: ["Other Angels' Average", "Number of Investments (#)"], investmentNumber: dealsPerIndvInvestor })

                  let averageInvestmentNumberLabels = []
                  let averageInvestmentNumberData = []
                  averages.forEach(average => {
                    //SET STATE WITH LIST OF LABELS
                    averageInvestmentNumberLabels.push(average.label)
                    //SET STATE WITH AVERAGES
                    averageInvestmentNumberData.push((Math.round(average.investmentNumber * 100) / 100))
                  })
                  this.setState({ averageInvestmentNumberLabels: averageInvestmentNumberLabels })
                  this.setState({ averageInvestmentNumberData: averageInvestmentNumberData })


                })
                .catch(error => {
                  throw error;
                })

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
      labels: this.state.averageInvestmentNumberLabels,
      datasets: [{
        label: 'Investment Number (#)',
        data: this.state.averageInvestmentNumberData,
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
      title: {
        display: true,
        text: 'Average Investment Number (#)'
      },
      legend: {
        display: false
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