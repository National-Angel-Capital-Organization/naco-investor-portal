import React, { Component } from 'react'
import { Bar } from 'react-chartjs-2';
import axios from 'axios'
import axiosHeaders from '../../axios-headers'

export default class AverageInvestmentNumberChart extends Component {
  state = {
    averageInvestmentNumberLabels: [],
    averageInvestmentNumberData: []
  }


  componentDidMount() {

    // GET USER INVESTMENT NUMBER

    axiosHeaders.generateHeaders().then((headers) => {
      axios('/.netlify/functions/get', {
        method: 'GET',
        headers,
        params: {
          path: "rest/v2/tables/IndvInvestorDeals/records", select: { 0: 'COUNT(IndvInvestor_GUID)%20AS%20userInvestmentNumber' }, where: { userSpecific: true }
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
            params: { path: "rest/v2/tables/IndvInvestorDeals/records", select: { 0: 'COUNT(IndvInvestor_GUID)%20AS%20indvInvestorDealsNumber' }, where: { notUser: true } }
          }
          )
            .then(res => {
              const indvInvestorDealsNumber = res.data.Result[0].indvInvestorDealsNumber
              console.log(indvInvestorDealsNumber)

              // GET NUMBER OF INDIVIDUAL INVESTORS
              axios('/.netlify/functions/get', {
                method: 'GET',
                headers,
                params: { path: "rest/v2/tables/IndvInvestorDeals/records", select: { 0: 'COUNT(DISTINCT%20IndvInvestor_Email)%20AS%20indvInvestorsNumber' }, where: { notUser: true } }
              }
              )
                .then(res => {
                  console.log(res)
          //         const angelMembersInvested = res.data.Result[0].totalMemberInvestorsNumber
          //         const investmentPerAngel = angelGroupSum / angelMembersInvested

          //         // GET AVERAGE INVESTMENT FROM INDIVIDUAL ANGELS THAT ARE NOT THE USER
          //         axios('/.netlify/functions/get', {
          //           method: 'GET',
          //           headers,
          //           params: { path: "rest/v2/tables/IndvInvestorDeals/records", select: { 0: 'AVG(IndvInvestor_DollarsInvested)%20AS%20indvInvestorAverageInvestmentNumber' }, where: { notUser: true } }
          //         }
          //         )
          //           .then(res => {
          //             const indvInvestorAverageInvestmentNumber = res.data.Result[0].indvInvestorAverageInvestmentNumber

          //             averages.push({ label: 'Average Investment ($)', averageInvestmentNumber: (indvInvestorAverageInvestmentNumber + investmentPerAngel) / 2, })

          //             let averageInvestmentNumberLabels = []
          //             let averageInvestmentNumberData = []
          //             averages.forEach(average => {
          //               //SET STATE WITH LIST OF LABELS
          //               averageInvestmentNumberLabels.push(average.label)
          //               //SET STATE WITH AVERAGES
          //               averageInvestmentNumberData.push(Math.round(average.averageInvestmentNumber))
          //             })
          //             this.setState({ averageInvestmentNumberLabels: averageInvestmentNumberLabels })
          //             this.setState({ averageInvestmentNumberData: averageInvestmentNumberData })
          //           })
          //           .catch(error => {
          //             throw error;
          //           })

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





  render() {
    const data = {
      labels: this.state.averageInvestmentNumberLabels,
      datasets: [{
        label: 'Average Investment Number (#)',
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

    return (
      <Bar
        data={data}
        width={100}
        height={50}
      />
    )
  }

}