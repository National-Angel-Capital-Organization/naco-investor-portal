import React, { Component } from 'react'
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
    yearList: ['all years.', '2018.', '2017.', '2016.', '2015.', '2014.', '2013.', '2012.', '2011.', '2010.']
  }

  handleDropdownChange = (event, index, value) => {
    this.setState({ currentYear: value })
  }

  handleYear = (yearString) => {
    let currentYear = yearString;

    if (yearString === 'all years.') {
      currentYear = '%25'
    } else {
      currentYear = yearString.slice(0, -1)
      currentYear = `%25${currentYear}%25`
    }
    return currentYear;
  }

  render() {
    return (
      <div>
        <h1>General Dashboard</h1>
        <p>Here you can find general investment information from
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
        </p>
        <div className='chart-wrapper'>
          <div className='chart-container doughnut'>
            <TotalInvestmentNumberChart year={this.handleYear(this.state.currentYear)} />
            <TotalInvestmentDollarChart year={this.handleYear(this.state.currentYear)} />
          </div>
          <div className='chart-container bar'>
            <PremoneyValueChart year={this.handleYear(this.state.currentYear)} />
            <TotalSectorNumberChart year={this.handleYear(this.state.currentYear)} />
            <TotalSectorDollarChart year={this.handleYear(this.state.currentYear)} />
          </div>
        </div>
      </div>
    )
  }
}