import React, { Component } from 'react'
import { Doughnut } from 'react-chartjs-2';
import axios from 'axios'
import axiosHeaders from '../../axios-headers'
import dashboardFunctions from '../../dashboard-functions'

export default class InvestmentDollarChart extends Component {

  state = {
    investmentDollarLabels: [],
    investmentDollarData: [],
    isData: false,
  }

  fetchData = (year) => {
    axiosHeaders.generateHeaders().then((headers) => {

      // GET SUM OF INVESTMENT FROM INVESTOR
      axios('/.netlify/functions/get', {
        method: 'GET',
        headers,
        params: { path: "rest/v2/tables/IndvInvestorDeals/records", select: { 0: 'IndvInvestor_NeworFollowOn', 1: 'SUM(IndvInvestor_DollarsInvested)%20AS%20dollarInvested' }, where: { userSpecific: true, IndvInvestor_Email_Year: { query: year, type: '%20LIKE%20' } }, groupBy: 'IndvInvestor_NeworFollowOn' }
      }
      )
        .then(res => {
          let newFollowOn = res.data.Result
          let investmentDollarLabels = []
          let investmentDollarData = []
          newFollowOn.forEach(type => {
            //SET STATE WITH LIST OF LABELS
            investmentDollarLabels.push(type.IndvInvestor_NeworFollowOn)
            //SET STATE WITH SUM OF INVESTMENT VALUE
            investmentDollarData.push(Math.round(type.dollarInvested))
          })
          this.setState({ isData: dashboardFunctions.checkForData(investmentDollarData) })
          this.setState({ investmentDollarLabels: investmentDollarLabels })
          this.setState({ investmentDollarData: investmentDollarData })
        })
        .catch(error => {
          throw error;
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
      labels: this.state.investmentDollarLabels,
      datasets: [{
        label: 'Your Total Investment ($)',
        data: this.state.investmentDollarData,
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
        text: 'Your Total Investment ($)'
      },
      legend: {
        position: 'bottom'
      }
    }

    const graphOrPlaceholder = (dataPresent) => {
      if (dataPresent) {
        return (<Doughnut
          data={data}
          width={100}
          height={50}
          options={options}
        />)
      } else {
        return (<p>No Data</p>)
      }
    }

    return (
      graphOrPlaceholder(this.state.isData)
    )
  }

}