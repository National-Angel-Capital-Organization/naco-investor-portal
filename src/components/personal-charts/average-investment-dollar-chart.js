import React, { Component } from 'react'
import { Bar } from 'react-chartjs-2';
import axios from 'axios'
import axiosHeaders from '../../axios-headers'
import dashboardFunctions from '../../dashboard-functions'

export default class AverageInvestmentDollarChart extends Component {
  state = {
    averageInvestmentDollarLabels: [],
    averageInvestmentDollarData: [],
    isData: false,
  }

  fetchData = (year) => {
    // GET AVERAGE INVESTMENT DOLLAR AMOUNTS

    axiosHeaders.generateHeaders().then((headers) => {
      axios('/.netlify/functions/get', {
        method: 'GET',
        headers,
        params: {
          path: "rest/v2/tables/IndvInvestorDeals/records", select: { 0: 'AVG(IndvInvestor_DollarsInvested)%20AS%20personalAverageInvestmentDollar' }, where: { userSpecific: true, IndvInvestor_Email_Year: { query: year, type: '%20LIKE%20' } }
        }
      })
        .then(res => {
          const personalAverage = dashboardFunctions.emptyToZero(res.data.Result[0])
          let averages = [];
          averages.push({ label: 'Your Average Investment ($)', averageInvestmentDollar: personalAverage.personalAverageInvestmentDollar, })

          // GET SUM OF DEALS FROM ANGEL GROUPS
          axios('/.netlify/functions/get', {
            method: 'GET',
            headers,
            params: { path: "rest/v2/tables/Deals/records", select: { 0: 'SUM(Deal_DollarInvested)%20AS%20totalDealSum' }, where: { Deal_MemberInvestors_Num: { query: '0', type: '%20>%20' }, Group_NameAndSubmissionYear: { query: year, type: '%20LIKE%20' } } }
          }
          )
            .then(res => {
              const angelGroupSum = dashboardFunctions.emptyToZero(res.data.Result[0].totalDealSum)


              // GET TOTAL NUMBER OF INVESTORS FROM ANGEL GROUPS
              axios('/.netlify/functions/get', {
                method: 'GET',
                headers,
                params: { path: "rest/v2/tables/Deals/records", select: { 0: 'SUM(Deal_MemberInvestors_Num)%20AS%20totalMemberInvestorsNumber' }, where: { Deal_DollarInvested: { query: '0', type: '%20>%20' }, Group_NameAndSubmissionYear: { query: year, type: '%20LIKE%20' } } }
              }
              )
                .then(res => {
                  const angelMembersInvested = dashboardFunctions.emptyToZero(res.data.Result[0].totalMemberInvestorsNumber)
                  let investmentPerAngel = 0
                  if (angelGroupSum !== 0 && angelMembersInvested !== 0) {
                    investmentPerAngel = angelGroupSum / angelMembersInvested
                  }

                  // GET AVERAGE INVESTMENT FROM INDIVIDUAL ANGELS THAT ARE NOT THE USER
                  axios('/.netlify/functions/get', {
                    method: 'GET',
                    headers,
                    params: { path: "rest/v2/tables/IndvInvestorDeals/records", select: { 0: 'AVG(IndvInvestor_DollarsInvested)%20AS%20indvInvestorAverageInvestmentDollar' }, where: { notUser: true, IndvInvestor_Email_Year: { query: year, type: '%20LIKE%20' } } }
                  }
                  )
                    .then(res => {
                      const indvInvestorAverageInvestmentDollar = dashboardFunctions.emptyToZero(res.data.Result[0].indvInvestorAverageInvestmentDollar)

                      averages.push({ label: ['Average Investment', 'by Other Angels ($)'], averageInvestmentDollar: (indvInvestorAverageInvestmentDollar + investmentPerAngel) / 2, })
                      console.log(angelGroupSum)
                      let averageInvestmentDollarLabels = []
                      let averageInvestmentDollarData = []
                      averages.forEach(average => {
                        //SET STATE WITH LIST OF LABELS
                        averageInvestmentDollarLabels.push(average.label)
                        //SET STATE WITH AVERAGES
                        averageInvestmentDollarData.push(Math.round(average.averageInvestmentDollar))
                      })
                      this.setState({ isData: dashboardFunctions.checkForData(averageInvestmentDollarData) })
                      this.setState({ averageInvestmentDollarLabels: averageInvestmentDollarLabels })
                      this.setState({ averageInvestmentDollarData: averageInvestmentDollarData })
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
      labels: this.state.averageInvestmentDollarLabels,
      datasets: [{
        label: 'Investment Amount ($)',
        data: this.state.averageInvestmentDollarData,
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
      legend: {
        display: false
      },
      title: {
        display: true,
        text: 'Average Investment Amount ($)'
      },
    }

    const graphOrPlaceholder = (dataPresent) => {
      if (dataPresent) {
        return (<Bar
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