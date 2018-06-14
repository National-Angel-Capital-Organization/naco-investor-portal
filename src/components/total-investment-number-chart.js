import React, { Component } from 'react'
import { Doughnut } from 'react-chartjs-2';
import axios from 'axios'
import axiosHeaders from '../axios-headers'

export default class TotalInvestmentNumberChart extends Component {

  state = {
    TotalInvestmentNumberLabels: [],
    TotalInvestmentNumberData: []
  }



  componentDidMount() {

    // GET COUNT OF DEALS FROM ANGEL GROUPS

    axiosHeaders.generateHeaders().then((headers) => {
      axios('/.netlify/functions/get', {
        method: 'GET',
        headers,
        params: { path: "rest/v2/tables/Deals/records", select: { 0: 'Deal_NewOrFollowon', 1: 'COUNT(Deal_DealRef)%20AS%20DealInvestmentNumber' }, where: { Group_NameAndSubmissionYear: { query: '%252017%25', type: '%20LIKE%20' } }, groupBy: 'Deal_NewOrFollowon' }
      }
      )
        .then(res => {
          let newFollowOn = [];
          res.data.Result.forEach(type => {
            if (type.Deal_NewOrFollowon !== '') {
              newFollowOn.push({ label: type.Deal_NewOrFollowon, dealNumber: type.DealInvestmentNumber })
            }
          });

          // GET COUNT OF DEALS FROM INDIVIDUAL INVESTORS
                  axios('/.netlify/functions/get', {
          method: 'GET',
            headers,
            params: { path: "rest/v2/tables/IndvInvestorDeals/records", select: { 0: 'IndvInvestor_NeworFollowOn', 1: 'COUNT(IndvInvestor_DealRef)%20AS%20IndvInvestorDealInvestmentNumber' }, where: { IndvInvestor_Email_Year: { query: '%252017%25', type: '%20LIKE%20' } }, groupBy: 'IndvInvestor_NeworFollowOn' }
        }
        )
            .then(res => {
              res.data.Result.forEach(indvInvestorType => {
                newFollowOn.forEach(type => {
                  if (indvInvestorType.IndvInvestor_NeworFollowOn.toLowerCase() === type.label.toLowerCase()) {
                    type.indvInvestorDealNumber = indvInvestorType.IndvInvestorDealInvestmentNumber
                  }
                })
              });
              let totalInvestmentNumberLabels = []
              let totalInvestmentNumberData = []
              newFollowOn.forEach(type => {
                //SET STATE WITH LIST OF LABELS
                totalInvestmentNumberLabels.push(type.label)
                //SET STATE WITH SUM OF DEAL NUMBERS
                totalInvestmentNumberData.push(type.indvInvestorDealNumber + type.dealNumber)
              })
              this.setState({ TotalInvestmentNumberLabels: totalInvestmentNumberLabels })
              this.setState({ TotalInvestmentNumberData: totalInvestmentNumberData })
              console.log(this.state)
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
      labels: this.state.TotalInvestmentNumberLabels,
      datasets: [{
        label: 'Total Investment (#)',
        data: this.state.TotalInvestmentNumberData,
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