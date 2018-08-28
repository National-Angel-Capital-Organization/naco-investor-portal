import React, { Component } from 'react'
import { defaults } from 'react-chartjs-2';
import axios from 'axios'
import axiosHeaders from '../axios-headers'
import SelectField from 'material-ui/SelectField'
import MenuItem from 'material-ui/MenuItem'
import AverageInvestmentDollarChart from '../components/personal-charts/average-investment-dollar-chart'
import AverageInvestmentNumberChart from '../components/personal-charts/average-investment-number-chart'
import InvestmentDollarChart from '../components/personal-charts/investment-dollar-chart'
import InvestmentNumberChart from '../components/personal-charts/investment-number-chart'
import SectorDollarChart from '../components/personal-charts/sector-dollar-chart'
import SectorNumberChart from '../components/personal-charts/sector-number-chart'

//Set all charts to begin at Zero
defaults.scale.ticks.beginAtZero = true;

export default class PersonalDashboard extends Component {

  state = {
    currentYear: 'all years.',
    error: '',
    yearList: ['all years.', '2018.', '2017.', '2016.', '2015.', '2014.', '2013.', '2012.', '2011.', '2010.'],
    data: {},
    isLoading: true
  }

  componentDidMount() {
    axiosHeaders.generateHeaders().then((headers) => {
      axios('/.netlify/functions/personal-dashboard', {
        method: 'GET',
        headers
      }
      )
        .then(res => {
          console.log(res)
          this.setState({ data: res.data })
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

  averageDataForChart(chart, year, groupData) {
    let data = {}
    if (groupData) {
      if (Object.keys(this.state.data).length <= 0) {
        data = {}
      } else if (year === 'unfiltered') {
        data['Your Total'] = this.state.data.investor[chart]['unfiltered'].userSum
        data['Average Investor Total'] = (this.state.data.investor[chart]['unfiltered']['otherSum'] + this.state.data.group[chart]['unfiltered']['sum']) / (this.state.data.investor[chart]['unfiltered']['memberNumber'] + this.state.data.group[chart]['unfiltered']['memberNumber'])
      } else {
        data['Your Total'] = this.state.data.investor[chart].years[year]['unfiltered'].userSum
        data['Average Investor Total'] = (this.state.data.investor[chart].years[year]['unfiltered']['otherSum'] + this.state.data.group[chart].years[year]['unfiltered']['sum']) / (this.state.data.investor[chart].years[year]['unfiltered']['memberNumber'] + this.state.data.group[chart].years[year]['unfiltered']['memberNumber'])
      }
    } else {
      if (Object.keys(this.state.data).length <= 0) {
        data = {}
      } else if (year === 'unfiltered') {
        data['Your Total'] = this.state.data.investor[chart]['unfiltered'].userNumber
        data['Average Investor Total'] = this.state.data.investor[chart]['unfiltered'].otherNumber
      } else {
        data['Your Total'] = this.state.data.investor[chart].years[year]['unfiltered'].userNumber
        data['Average Investor Total'] = this.state.data.investor[chart].years[year]['unfiltered'].otherNumber
      }
    }
    return data
  }

  dataForChart(chart, year) {
    let data = {}
    if (Object.keys(this.state.data).length <= 0) {
      data = {}
    } else if (year === 'unfiltered') {
      data = this.state.data.investor[chart]['unfiltered']
    } else {
      data = this.state.data.investor[chart].years[year].unfiltered
    }
    return data
  }

  render() {

    let year = this.handleYear(this.state.currentYear)

    return (
      <div>
        <h1>Personal Dashboard</h1>
        <div className="selection-text">Here you can find personal investment information from
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
            <InvestmentDollarChart isLoading={this.state.isLoading} data={this.dataForChart('userInvestmentDollars', year)} />
            <InvestmentNumberChart isLoading={this.state.isLoading} data={this.dataForChart('userInvestmentNumber', year)} />
          </div>
          <div className='chart-container bar'>
            <AverageInvestmentDollarChart isLoading={this.state.isLoading} data={this.averageDataForChart('averageInvestmentDollar', year, true)} />
            <AverageInvestmentNumberChart isLoading={this.state.isLoading} data={this.averageDataForChart('averageNumberOfInvestments', year, false)} />
            <SectorDollarChart isLoading={this.state.isLoading} data={this.dataForChart('dollarsBySector', year)} />
            <SectorNumberChart isLoading={this.state.isLoading} data={this.dataForChart('numberBySector', year)} />
          </div>
        </div>
      </div>
    )
  }
}