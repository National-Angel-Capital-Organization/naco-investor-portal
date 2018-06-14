import React, { Component } from 'react'
import { Doughnut } from 'react-chartjs-2';
import axios from 'axios'
import axiosHeaders from '../axios-headers'

export default class TotalInvestmentDollarChart extends Component {

  state = {
    TotalInvestmentDollarLabels: [],
    TotalInvestmentDollarData: []
  }



  componentDidMount() {

    // GET SUM OF INVESTMENT FROM ANGEL GROUPS

    axiosHeaders.generateHeaders().then((headers) => {
      axios('/.netlify/functions/get', {
        method: 'GET',
        headers,
        params: { path: "rest/v2/tables/Deals/records", select: { 0: 'Deal_NewOrFollowon', 1: 'SUM(Deal_DollarInvested)%20AS%20DealDollarInvested' }, where: { Group_NameAndSubmissionYear: { query: '%252017%25', type: '%20LIKE%20' } }, groupBy: 'Deal_NewOrFollowon' }
      }
      )
        .then(res => {
          let newFollowOn = [];
          res.data.Result.forEach(type => {
            if (type.Deal_NewOrFollowon !== '') {
              newFollowOn.push({ label: type.Deal_NewOrFollowon, DealDollarInvested: type.DealDollarInvested })
            }
          });

          // GET SUM OF INVESTMENT FROM INDIVIDUAL INVESTORS
          axios('/.netlify/functions/get', {
            method: 'GET',
            headers,
            params: { path: "rest/v2/tables/IndvInvestorDeals/records", select: { 0: 'IndvInvestor_NeworFollowOn', 1: 'SUM(IndvInvestor_DollarsInvested)%20AS%20IndvInvestorDealDollarInvested' }, where: { IndvInvestor_Email_Year: { query: '%252017%25', type: '%20LIKE%20' } }, groupBy: 'IndvInvestor_NeworFollowOn' }
          }
          )
            .then(res => {
              res.data.Result.forEach(indvInvestorType => {
                newFollowOn.forEach(type => {
                  if (indvInvestorType.IndvInvestor_NeworFollowOn.toLowerCase() === type.label.toLowerCase()) {
                    type.IndvInvestorDealDollarInvested = indvInvestorType.IndvInvestorDealDollarInvested
                  }
                })
              });
              let totalInvestmentDollarLabels = []
              let totalInvestmentDollarData = []
              newFollowOn.forEach(type => {
                //SET STATE WITH LIST OF LABELS
                totalInvestmentDollarLabels.push(type.label)
                //SET STATE WITH SUM OF INVESTMENT VALUE
                totalInvestmentDollarData.push(Math.round(type.IndvInvestorDealDollarInvested + type.DealDollarInvested))
              })
              this.setState({ TotalInvestmentDollarLabels: totalInvestmentDollarLabels })
              this.setState({ TotalInvestmentDollarData: totalInvestmentDollarData })
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
      labels: this.state.TotalInvestmentDollarLabels,
      datasets: [{
        label: 'Total Investment ($)',
        data: this.state.TotalInvestmentDollarData,
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
    return (
      <Doughnut
        data={data}
        width={100}
        height={50}
      />
    )
  }

}