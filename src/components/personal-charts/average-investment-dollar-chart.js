import React, { Component } from 'react'
import { Bar } from 'react-chartjs-2';
import axios from 'axios'
import axiosHeaders from '../../axios-headers'

export default class AverageInvestmentDollarChart extends Component {
  state = {
    averageInvestmentDollarLabels: [],
    averageInvestmentDollarData: []
  }


  componentDidMount() {

    // GET AVERAGE INVESTMENT DOLLAR AMOUNTS

    axiosHeaders.generateHeaders().then((headers) => {
      axios('/.netlify/functions/get', {
        method: 'GET',
        headers,
        params: {
          path: "rest/v2/tables/IndvInvestorDeals/records", select: { 0: 'AVG(IndvInvestor_DollarsInvested)%20AS%20personalAverageInvestmentDollar' }, where: { userSpecific: true }
        }
      })
        .then(res => {
          const personalAverage = res.data.Result[0]
          let averages = [];
          averages.push({ label: 'Your Average Investment ($)', averageInvestmentDollar: personalAverage.personalAverageInvestmentDollar, })

          // GET SUM OF DEALS FROM ANGEL GROUPS
          axios('/.netlify/functions/get', {
            method: 'GET',
            headers,
            params: { path: "rest/v2/tables/Deals/records", select: { 0: 'SUM(Deal_DollarInvested)%20AS%20totalDealSum' }, where: { Deal_MemberInvestors_Num: { query: '0', type: '%20>%20' } } }
          }
          )
            .then(res => {
              const angelGroupSum = res.data.Result[0].totalDealSum


              // GET TOTAL NUMBER OF INVESTORS FROM ANGEL GROUPS
              axios('/.netlify/functions/get', {
                method: 'GET',
                headers,
                params: { path: "rest/v2/tables/Deals/records", select: { 0: 'SUM(Deal_MemberInvestors_Num)%20AS%20totalMemberInvestorsNumber' }, where: { Deal_DollarInvested: { query: '0', type: '%20>%20' } } }
              }
              )
                .then(res => {
                  const angelMembersInvested = res.data.Result[0].totalMemberInvestorsNumber
                  const investmentPerAngel = angelGroupSum / angelMembersInvested

                  // GET AVERAGE INVESTMENT FROM INDIVIDUAL ANGELS THAT ARE NOT THE USER
                  axios('/.netlify/functions/get', {
                    method: 'GET',
                    headers,
                    params: { path: "rest/v2/tables/IndvInvestorDeals/records", select: { 0: 'AVG(IndvInvestor_DollarsInvested)%20AS%20indvInvestorAverageInvestmentDollar' }, where: { notUser: true } }
                  }
                  )
                    .then(res => {
                      const indvInvestorAverageInvestmentDollar = res.data.Result[0].indvInvestorAverageInvestmentDollar

                      averages.push({ label: 'Average Investment by Other Angels ($)', averageInvestmentDollar: (indvInvestorAverageInvestmentDollar + investmentPerAngel) / 2, })

                      let averageInvestmentDollarLabels = []
                      let averageInvestmentDollarData = []
                      averages.forEach(average => {
                        //SET STATE WITH LIST OF LABELS
                        averageInvestmentDollarLabels.push(average.label)
                        //SET STATE WITH AVERAGES
                        averageInvestmentDollarData.push(Math.round(average.averageInvestmentDollar))
                      })
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





  render() {
    const data = {
      labels: this.state.averageInvestmentDollarLabels,
      datasets: [{
        label: 'Average Investment Amount ($)',
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

    return (
      <Bar
        data={data}
        width={100}
        height={50}
      />
    )
  }

}