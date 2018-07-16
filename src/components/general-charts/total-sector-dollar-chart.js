import React, { Component } from 'react'
import { Bar } from 'react-chartjs-2';
import axios from 'axios'
import axiosHeaders from '../../axios-headers'
import dashboardFunctions from '../../dashboard-functions'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

export default class TotalSectorDollarChart extends Component {

  state = {
    totalSectorDollarLabels: [],
    totalSectorDollarData: [],
    isData: false,
    isLoading: true,
  }

  fetchData = (year) => {

    // GET INVESTMENT DOLLAR AMOUNTS

    axiosHeaders.generateHeaders().then((headers) => {
      axios('/.netlify/functions/get', {
        method: 'GET',
        headers,
        params: { path: "rest/v2/tables/Deals/records", select: { 0: 'Deal_MajorSector', 1: 'SUM(Deal_DollarInvested)%20AS%20totalSectorDollar' }, where: { Group_NameAndSubmissionYear: { query: year, type: '%20LIKE%20' } }, groupBy: 'Deal_MajorSector' }
      }
      )
        .then(res => {
          let sectors = [{ label: 'Clean Technologies', totalSectorDollar: 0, indvInvestorTotalSectorDollar: 0 }, { label: 'Energy', totalSectorDollar: 0, indvInvestorTotalSectorDollar: 0 }, { label: 'ICT', totalSectorDollar: 0, indvInvestorTotalSectorDollar: 0 }, { label: 'Life Sciences', totalSectorDollar: 0, indvInvestorTotalSectorDollar: 0 }, { label: 'Manufacturing', totalSectorDollar: 0, indvInvestorTotalSectorDollar: 0 }, { label: 'Services', totalSectorDollar: 0, indvInvestorTotalSectorDollar: 0 },];
          res.data.Result.forEach(sector => {
            switch (sector.Deal_MajorSector.toLowerCase()) {
              case sectors[0].label.toLowerCase():
                sectors[0].totalSectorDollar = sector.totalSectorDollar
                break
              case sectors[1].label.toLowerCase():
                sectors[1].totalSectorDollar = sector.totalSectorDollar
                break
              case sectors[2].label.toLowerCase():
                sectors[2].totalSectorDollar = sector.totalSectorDollar
                break
              case sectors[3].label.toLowerCase():
                sectors[3].totalSectorDollar = sector.totalSectorDollar
                break
              case sectors[4].label.toLowerCase():
                sectors[4].totalSectorDollar = sector.totalSectorDollar
                break
              case sectors[5].label.toLowerCase():
                sectors[5].totalSectorDollar = sector.totalSectorDollar
                break
            }

          });

          // GET DOLLAR AMOUNT OF DEALS FROM INDIVIDUAL INVESTORS
          axios('/.netlify/functions/get', {
            method: 'GET',
            headers,
            params: { path: "rest/v2/tables/IndvInvestorDeals/records", select: { 0: 'IndvInvestor_CompanyMajorSector', 1: 'SUM(IndvInvestor_DollarsInvested)%20AS%20indvInvestorTotalSectorDollar' }, where: { IndvInvestor_Email_Year: { query: year, type: '%20LIKE%20' } }, groupBy: 'IndvInvestor_CompanyMajorSector' }
          }
          )
            .then(res => {
              res.data.Result.forEach(indvInvestorSector => {
                switch (indvInvestorSector.IndvInvestor_CompanyMajorSector.toLowerCase()) {
                  case sectors[0].label.toLowerCase():
                    sectors[0].indvInvestorTotalSectorDollar = indvInvestorSector.indvInvestorTotalSectorDollar
                    break
                  case sectors[1].label.toLowerCase():
                    sectors[1].indvInvestorTotalSectorDollar = indvInvestorSector.indvInvestorTotalSectorDollar
                    break
                  case sectors[2].label.toLowerCase():
                    sectors[2].indvInvestorTotalSectorDollar = indvInvestorSector.indvInvestorTotalSectorDollar
                    break
                  case sectors[3].label.toLowerCase():
                    sectors[3].indvInvestorTotalSectorDollar = indvInvestorSector.indvInvestorTotalSectorDollar
                    break
                  case sectors[4].label.toLowerCase():
                    sectors[4].indvInvestorTotalSectorDollar = indvInvestorSector.indvInvestorTotalSectorDollar
                    break
                  case sectors[5].label.toLowerCase():
                    sectors[5].indvInvestorTotalSectorDollar = indvInvestorSector.indvInvestorTotalSectorDollar
                    break
                }
              });

              let totalSectorDollarLabels = []
              let totalSectorDollarData = []
              sectors.forEach(sector => {
                //SET STATE WITH LIST OF LABELS
                totalSectorDollarLabels.push(sector.label)
                //SET STATE WITH SUM OF DEAL DOLLARS
                totalSectorDollarData.push(Math.round(sector.indvInvestorTotalSectorDollar + sector.totalSectorDollar))
              })
              this.setState({ isData: dashboardFunctions.checkForData(totalSectorDollarData) })
              this.setState({ totalSectorDollarLabels: totalSectorDollarLabels })
              this.setState({ totalSectorDollarData: totalSectorDollarData })
              this.setState({ isLoading: false })
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
      labels: this.state.totalSectorDollarLabels,
      datasets: [{
        label: 'Total Sector ($)',
        data: this.state.totalSectorDollarData,
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
      layout: {
        padding: {
          left: 30,
          right: 30,
          top: 30,
          bottom: 30
        }
      },
      legend: {
        display: false
      },
      title: {
        display: true,
        text: 'Total Sector ($)'
      },
      scales: {
        yAxes: [
          {
            ticks: {
              callback: function (label, index, labels) {
                return label / 1000000 + 'm';
              }
            },
            scaleLabel: {
              display: true,
              labelString: '1m = $1,000,000'
            }
          }
        ]
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
        return (<Bar
          data={data}
          width={100}
          height={50}
          options={options}
        />)
      } else {
        return (<div className="no-data">
          <FontAwesomeIcon icon="chart-bar" size="10x" />
          <p>No Data Available</p>
        </div>)
      }
    }

    return (
      graphOrPlaceholder(this.state.isData, this.state.isLoading)
    )
  }

}