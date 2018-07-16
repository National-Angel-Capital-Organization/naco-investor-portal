import React, { Component } from 'react'
import { Doughnut } from 'react-chartjs-2';
import axios from 'axios'
import axiosHeaders from '../../axios-headers'
import dashboardFunctions from '../../dashboard-functions'

export default class TotalInvestmentNumberChart extends Component {

  state = {
    TotalInvestmentNumberLabels: [],
    TotalInvestmentNumberData: [],
    isData: false,
  }

  fetchData = (year) => {
    // GET COUNT OF DEALS FROM ANGEL GROUPS

    axiosHeaders.generateHeaders().then((headers) => {
      axios('/.netlify/functions/get', {
        method: 'GET',
        headers,
        params: { path: "rest/v2/tables/Deals/records", select: { 0: 'Deal_NewOrFollowon', 1: 'COUNT(Deal_DealRef)%20AS%20DealInvestmentNumber' }, where: { Group_NameAndSubmissionYear: { query: year, type: '%20LIKE%20' } }, groupBy: 'Deal_NewOrFollowon' }
      }
      )
        .then(res => {
          let newFollowOn = [{ label: 'New', dealNumber: 0, indvInvestorDealNumber: 0 }, { label: 'Follow-On', dealNumber: 0, indvInvestorDealNumber: 0 }];
          res.data.Result.forEach(type => {
            switch (type.Deal_NewOrFollowon.toLowerCase()) {
              case newFollowOn[0].label.toLowerCase():
                newFollowOn[0].dealNumber = type.DealInvestmentNumber
                break
              case newFollowOn[1].label.toLowerCase():
                newFollowOn[1].dealNumber = type.DealInvestmentNumber
                break
            }
          });

          // GET COUNT OF DEALS FROM INDIVIDUAL INVESTORS
          axios('/.netlify/functions/get', {
            method: 'GET',
            headers,
            params: { path: "rest/v2/tables/IndvInvestorDeals/records", select: { 0: 'IndvInvestor_NeworFollowOn', 1: 'COUNT(IndvInvestor_DealRef)%20AS%20IndvInvestorDealInvestmentNumber' }, where: { IndvInvestor_Email_Year: { query: year, type: '%20LIKE%20' } }, groupBy: 'IndvInvestor_NeworFollowOn' }
          }
          )
            .then(res => {
              res.data.Result.forEach(indvInvestorType => {
                switch (indvInvestorType.IndvInvestor_NeworFollowOn.toLowerCase()) {
                  case newFollowOn[0].label.toLowerCase():
                    newFollowOn[0].indvInvestorDealNumber = indvInvestorType.IndvInvestorDealInvestmentNumber
                    break
                  case newFollowOn[1].label.toLowerCase():
                    newFollowOn[1].indvInvestorDealNumber = indvInvestorType.IndvInvestorDealInvestmentNumber
                    break
                }

              });
              let totalInvestmentNumberLabels = []
              let totalInvestmentNumberData = []
              newFollowOn.forEach(type => {
                //SET STATE WITH LIST OF LABELS
                totalInvestmentNumberLabels.push(type.label)
                //SET STATE WITH SUM OF DEAL NUMBERS
                totalInvestmentNumberData.push(type.indvInvestorDealNumber + type.dealNumber)
              })
              this.setState({ isData: dashboardFunctions.checkForData(totalInvestmentNumberData) })
              this.setState({ TotalInvestmentNumberLabels: totalInvestmentNumberLabels })
              this.setState({ TotalInvestmentNumberData: totalInvestmentNumberData })
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

    const options = {
      title: {
        display: true,
        text: 'Total Investment (#)'
      },
      legend: {
        position: 'bottom',
        reverse: true
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