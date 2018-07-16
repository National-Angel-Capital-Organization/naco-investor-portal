import React, { Component } from 'react'
import { Bar } from 'react-chartjs-2';
import axios from 'axios'
import axiosHeaders from '../../axios-headers'
import dashboardFunctions from '../../dashboard-functions'

export default class SectorDollarChart extends Component {

  state = {
    sectorDollarLabels: [],
    sectorDollarData: [],
    isData: false,
    isLoading: true,
  }

  fetchData = (year) => {
    // GET INVESTMENT DOLLAR AMOUNTS

    axiosHeaders.generateHeaders().then((headers) => {
      axios('/.netlify/functions/get', {
        method: 'GET',
        headers,
        params: {
          path: "rest/v2/tables/IndvInvestorDeals/records", select: { 0: 'IndvInvestor_CompanyMajorSector', 1: 'SUM(IndvInvestor_DollarsInvested)%20AS%20sectorDollar' }, where: { userSpecific: true, IndvInvestor_Email_Year: { query: year, type: '%20LIKE%20' } }, groupBy: 'IndvInvestor_CompanyMajorSector'
        }
      }
      )
        .then(res => {
          let sectors = [];
          res.data.Result.forEach(sector => {
            if (sector.IndvInvestor_CompanyMajorSector !== '' && sector.IndvInvestor_CompanyMajorSector !== 'Other') {
              sectors.push({ label: sector.IndvInvestor_CompanyMajorSector, sectorDollar: sector.sectorDollar })
            }
          });

          let sectorDollarLabels = []
          let sectorDollarData = []
          sectors.forEach(sector => {
            //SET STATE WITH LIST OF LABELS
            sectorDollarLabels.push(sector.label)
            //SET STATE WITH SUM OF DEAL DOLLARS
            sectorDollarData.push(Math.round(sector.sectorDollar))
          })
          this.setState({ isData: dashboardFunctions.checkForData(sectorDollarData) })
          this.setState({ sectorDollarLabels: sectorDollarLabels })
          this.setState({ sectorDollarData: sectorDollarData })
          this.setState({ isLoading: false })
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
      labels: this.state.sectorDollarLabels,
      datasets: [{
        label: 'Total Sector ($)',
        data: this.state.sectorDollarData,
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
      title: {
        display: true,
        text: 'Deal Sector Dollar Comparison ($)'
      },
      legend: {
        display: false
      },
      scales: {
        yAxes: [
          {
            ticks: {
              callback: function (label, index, labels) {
                return label / 1000 + 'k';
              }
            },
            scaleLabel: {
              display: true,
              labelString: '1k = $1,000'
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
        return (<p>No Data</p>)
      }
    }

    return (
      graphOrPlaceholder(this.state.isData, this.state.isLoading)
    )
  }

}