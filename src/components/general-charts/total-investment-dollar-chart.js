import React, { Component } from 'react'
import { Doughnut } from 'react-chartjs-2';
import axios from 'axios'
import axiosHeaders from '../../axios-headers'
import dashboardFunctions from '../../dashboard-functions'

export default class TotalInvestmentDollarChart extends Component {

  state = {
    TotalInvestmentDollarLabels: [],
    TotalInvestmentDollarData: [],
    isData: false,
  }

  fetchData = (year) => {

    // GET SUM OF INVESTMENT FROM ANGEL GROUPS

    axiosHeaders.generateHeaders().then((headers) => {
      axios('/.netlify/functions/get', {
        method: 'GET',
        headers,
        params: { path: "rest/v2/tables/Deals/records", select: { 0: 'Deal_NewOrFollowon', 1: 'SUM(Deal_DollarInvested)%20AS%20DealDollarInvested' }, where: { Group_NameAndSubmissionYear: { query: year, type: '%20LIKE%20' } }, groupBy: 'Deal_NewOrFollowon' }
      }
      )
        .then(res => {
          let newFollowOn = [{ label: 'New', DealDollarInvested: 0, IndvInvestorDealDollarInvested: 0 }, { label: 'Follow-On', DealDollarInvested: 0, IndvInvestorDealDollarInvested: 0 }];
          res.data.Result.forEach(type => {

            switch (type.Deal_NewOrFollowon.toLowerCase()) {
              case newFollowOn[0].label.toLowerCase():
                newFollowOn[0].DealDollarInvested = type.DealDollarInvested
                break
              case newFollowOn[1].label.toLowerCase():
                newFollowOn[1].DealDollarInvested = type.DealDollarInvested
                break
            }
          });
          // GET SUM OF INVESTMENT FROM INDIVIDUAL INVESTORS
          axios('/.netlify/functions/get', {
            method: 'GET',
            headers,
            params: { path: "rest/v2/tables/IndvInvestorDeals/records", select: { 0: 'IndvInvestor_NeworFollowOn', 1: 'SUM(IndvInvestor_DollarsInvested)%20AS%20IndvInvestorDealDollarInvested' }, where: { IndvInvestor_Email_Year: { query: year, type: '%20LIKE%20' } }, groupBy: 'IndvInvestor_NeworFollowOn' }
          }
          )
            .then(res => {
              res.data.Result.forEach(indvInvestorType => {

                switch (indvInvestorType.IndvInvestor_NeworFollowOn.toLowerCase()) {
                  case newFollowOn[0].label.toLowerCase():
                    newFollowOn[0].IndvInvestorDealDollarInvested = indvInvestorType.IndvInvestorDealDollarInvested
                    break
                  case newFollowOn[1].label.toLowerCase():
                    newFollowOn[1].IndvInvestorDealDollarInvested = indvInvestorType.IndvInvestorDealDollarInvested
                    break
                }
              });

              let totalInvestmentDollarLabels = []
              let totalInvestmentDollarData = []
              newFollowOn.forEach(type => {
                //SET STATE WITH LIST OF LABELS
                totalInvestmentDollarLabels.push(type.label)
                //SET STATE WITH SUM OF INVESTMENT VALUE
                totalInvestmentDollarData.push(Math.round(type.IndvInvestorDealDollarInvested + type.DealDollarInvested))
              })
              this.setState({ isData: dashboardFunctions.checkForData(totalInvestmentDollarData) })
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

  componentDidMount() {
    this.fetchData('%25')

  }


  componentWillReceiveProps(newProps) {
    this.fetchData(newProps.year)
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

    const options = {
      title: {
        display: true,
        text: 'Total Investment ($)'
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