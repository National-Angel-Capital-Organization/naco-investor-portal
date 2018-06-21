import React, { Component } from 'react'
import { Doughnut } from 'react-chartjs-2';
import axios from 'axios'
import axiosHeaders from '../../axios-headers'

export default class InvestmentNumberChart extends Component {

  state = {
    investmentNumberLabels: [],
    investmentNumberData: []
  }


  componentDidMount() {


    axiosHeaders.generateHeaders().then((headers) => {

      // GET NUMBER OF INVESTMENTS FROM INVESTOR
      axios('/.netlify/functions/get', {
        method: 'GET',
        headers,
        params: { path: "rest/v2/tables/IndvInvestorDeals/records", select: { 0: 'IndvInvestor_NeworFollowOn', 1: 'COUNT(IndvInvestor_GUID)%20AS%20numberOfInvestments' }, where: { userSpecific: true }, groupBy: 'IndvInvestor_NeworFollowOn' }
      }
      )
        .then(res => {
          let newFollowOn = res.data.Result
          let investmentNumberLabels = []
          let investmentNumberData = []
          newFollowOn.forEach(type => {
            //SET STATE WITH LIST OF LABELS
            investmentNumberLabels.push(type.IndvInvestor_NeworFollowOn)
            //SET STATE WITH SUM OF INVESTMENT VALUE
            investmentNumberData.push(Math.round(type.numberOfInvestments))
          })
          this.setState({ investmentNumberLabels: investmentNumberLabels })
          this.setState({ investmentNumberData: investmentNumberData })
        })
        .catch(error => {
          throw error;
        })
    })
      .catch(error => {
        console.log(error)
      })

  }

  render() {
    const data = {
      labels: this.state.investmentNumberLabels,
      datasets: [{
        label: 'Your Total Number of Investments (#)',
        data: this.state.investmentNumberData,
        backgroundColor: [
          'rgba(255, 99, 132, 0.2)',
          'rgba(54, 162, 235, 0.2)'
        ],
        borderColor: [
          'rgba(255,99,132,1)',
          'rgba(54, 162, 235, 1)'
        ],
        borderWidth: 1
      }]
    }

    const options = {
      title: {
        display: true,
        text: 'Your Total Number of Investments (#)'
      },
      legend: {
        position: 'bottom'
      }
    }

    return (
      <Doughnut
        data={data}
        width={100}
        height={50}
        options={options}
      />
    )
  }

}