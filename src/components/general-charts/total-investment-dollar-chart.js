import React, { Component } from 'react'
import { Doughnut } from 'react-chartjs-2';
import axios from 'axios'
import axiosHeaders from '../../axios-headers'
import dashboardFunctions from '../../dashboard-functions'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

export default class TotalInvestmentDollarChart extends Component {

  state = {
    TotalInvestmentDollarLabels: [],
    TotalInvestmentDollarData: [],
    isData: false,
    isLoading: true,
  }

  newData = (data, loading) => {
    let TotalInvestmentDollarLabels = []
    let TotalInvestmentDollarData = []
    for (let sector in data) {
      TotalInvestmentDollarLabels.push(sector)
      TotalInvestmentDollarData.push(Math.round(data[sector]))
    }
    this.setState({ isData: dashboardFunctions.checkForData(TotalInvestmentDollarData) })
    this.setState({ TotalInvestmentDollarLabels: TotalInvestmentDollarLabels })
    this.setState({ TotalInvestmentDollarData: TotalInvestmentDollarData })
    if (!loading) {
      this.setState({ isLoading: false })
    }
  }

  componentDidMount() {
    this.newData(this.props.data, true)

  }


  componentWillReceiveProps(newProps) {
    this.newData(newProps.data, newProps.isLoading)
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
        text: 'Total Investment ($)'
      },
      legend: {
        position: 'bottom',
        reverse: true
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
          <p style={{ marginTop: '15px' }}>No Data Available</p>
        </div>)
      }
    }

    return (
      graphOrPlaceholder(this.state.isData, this.state.isLoading)
    )
  }

}