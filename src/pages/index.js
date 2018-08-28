import React, { Component } from 'react'
import axios from 'axios'
import axiosHeaders from '../axios-headers'
import SelectField from 'material-ui/SelectField'
import MenuItem from 'material-ui/MenuItem'
import PremoneyValueChart from '../components/general-charts/premoney-value-chart'
import TotalInvestmentNumberChart from '../components/general-charts/total-investment-number-chart'
import TotalInvestmentDollarChart from '../components/general-charts/total-investment-dollar-chart'
import TotalSectorNumberChart from '../components/general-charts/total-sector-number-chart'
import TotalSectorDollarChart from '../components/general-charts/total-sector-dollar-chart'
import { defaults } from 'react-chartjs-2';

//Set all charts to begin at Zero
defaults.scale.ticks.beginAtZero = true;

export default class IndexPage extends Component {

  state = {
    currentYear: 'all years.',
    error: '',
    yearList: ['all years.', '2018.', '2017.', '2016.', '2015.', '2014.', '2013.', '2012.', '2011.', '2010.'],
    data: {},
    isLoading: true
  }

  componentDidMount() {
    axiosHeaders.generateHeaders().then((headers) => {
      axios('/.netlify/functions/general-dashboard', {
        method: 'GET',
        headers
      }
      )
        .then(res => {
          this.setState({ data: res.data })
          this.setState({isLoading: false})
        })
        .catch(error => {
          throw error
        })
    })
      .catch(error => {
        console.log(error)
      })
    }

  handleDropdownChange = (event, index, value) => {
    this.setState({ currentYear: value })
  }

  handleYear = (yearString) => {
    let currentYear = yearString;

    if (yearString === 'all years.') {
      currentYear = 'unfiltered'
    } else {
      currentYear = yearString.slice(0, -1)
    }
    return currentYear;
  }

  dataForChart(chart, year, invdInvestorData) {
    let data = {}
    if (invdInvestorData) {
      if (Object.keys(this.state.data).length <= 0) {
        data = {}
      } else if (year === 'unfiltered') {
        for (let dataPoint in this.state.data.group[chart]['unfiltered']) {
          data[dataPoint] = this.state.data.group[chart]['unfiltered'][dataPoint] + this.state.data.investor[chart]['unfiltered'][dataPoint]
        }
      } else {
        for (let dataPoint in this.state.data.group[chart].years[year].unfiltered) {
          data[dataPoint] = this.state.data.group[chart].years[year].unfiltered[dataPoint] + this.state.data.investor[chart].years[year].unfiltered[dataPoint]
        }
      }
    } else {
    if (Object.keys(this.state.data).length <= 0) {
      data = {}
    } else if (year === 'unfiltered') {
      data = this.state.data.group[chart]['unfiltered']
    } else {
      data = this.state.data.group[chart].years[year].unfiltered
    }
  }
    return data
  }

  render() {
    let year = this.handleYear(this.state.currentYear)

    return (
      <div>
        <h1>General Dashboard</h1>
        <div className="selection-text">Here you can find general investment information from
          <SelectField
            value={this.state.currentYear}
            style={{ bottom: -26, width: '140px', paddingLeft: '5px', font: '18px "Roboto", sans-serif', fontWeight: '500' }}
            underlineStyle={{ borderColor: '#0079c1' }}
            iconStyle={{ fill: '#0079c1' }}
            selectedMenuItemStyle={{ color: 'rgba(0, 0, 0, 0.8)' }}
            onChange={this.handleDropdownChange}
            labelStyle={this.styles} 
            errorText={this.state.error}
          >
            {this.state.yearList.map(i => (
              <MenuItem
                style={{ paddingLeft: '5px', font: '18px "Roboto", sans-serif', color: 'rgba(0, 0, 0, 0.5)' }}
                width={'140px'}
                key={i}
                value={i}
                primaryText={i}
                name='Years'
              />
            ))}
          </SelectField>
        </div>
        <div className='chart-wrapper'>
          <div className='chart-container doughnut'>
            <TotalInvestmentNumberChart isLoading={this.state.isLoading} data={this.dataForChart('totalInvestmentNumber', year, true)} />
            <TotalInvestmentDollarChart isLoading={this.state.isLoading} data={this.dataForChart('totalInvestmentDollar', year, true)} />
          </div>
          <div className='chart-container bar'>
            <PremoneyValueChart isLoading={this.state.isLoading} data={this.dataForChart('averagePremoneyValue', year, false)} />
            <TotalSectorNumberChart isLoading={this.state.isLoading} data={this.dataForChart('totalSectorNumber', year, true)} />
            <TotalSectorDollarChart isLoading={this.state.isLoading} data={this.dataForChart('totalSectorDollar', year, true)} />
          </div>
        </div>
      </div>
    )
  }
}