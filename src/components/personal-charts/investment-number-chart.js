import React, { Component } from 'react'
import { Doughnut } from 'react-chartjs-2';
import axios from 'axios'
import axiosHeaders from '../../axios-headers'
import dashboardFunctions from '../../dashboard-functions'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

export default class InvestmentNumberChart extends Component {

  state = {
    investmentNumberLabels: [],
    investmentNumberData: [],
    isData: false,
    isLoading: true,
  }

  fetchData = (year) => {

    axiosHeaders.generateHeaders().then((headers) => {

      // GET NUMBER OF INVESTMENTS FROM INVESTOR
      axios('/.netlify/functions/get', {
        method: 'GET',
        headers,
        params: { path: "rest/v2/tables/IndvInvestorDeals/records", select: { 0: 'IndvInvestor_NeworFollowOn', 1: 'COUNT(IndvInvestor_GUID)%20AS%20numberOfInvestments' }, where: { userSpecific: true, IndvInvestor_Email_Year: { query: year, type: '%20LIKE%20' } }, groupBy: 'IndvInvestor_NeworFollowOn' }
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
          this.setState({ isData: dashboardFunctions.checkForData(investmentNumberData) })
          this.setState({ investmentNumberLabels: investmentNumberLabels })
          this.setState({ investmentNumberData: investmentNumberData })
          this.setState({ isLoading: false })
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
      layout: {
        padding: {
          left: 30,
          right: 30,
          top: 30,
          bottom: 30
        }
      },
      title: {
        display: true,
        text: 'Your Total Number of Investments (#)'
      },
      legend: {
        position: 'bottom'
      }
    }


    const graphOrPlaceholder = (dataPresent, loading) => {
      if (loading) {
        return (<div className="graph-loader">
          <div className="rect1"></div>
          <div className="rect2"></div>
          <div className="rect3"></div>
          <div className="rect4"></div>
          <div className="rect5"></div>
        </div>)
      } else if (dataPresent) {
        return (<Doughnut
          data={data}
          width={100}
          height={50}
          options={options}
        />)
      } else {
        return (<div className="no-data">
          <FontAwesomeIcon icon="chart-pie" size="8x" />
          <p style={ { marginTop: '15px'}}>No Data Available</p>
        </div>)
      }
    }

    return (
      graphOrPlaceholder(this.state.isData, this.state.isLoading)
    )
  }

}