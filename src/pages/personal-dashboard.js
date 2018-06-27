import React, { Component } from 'react'
import { defaults } from 'react-chartjs-2';
import { navigateTo } from "gatsby-link"
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
    yearList: ['all years.', '2018.', '2017.', '2016.']
  }

  handleDropdownChange = (event, index, value) => {
    this.setState({ currentYear: value })
  }

  render() {
    return (
      <div>
        <h1>Personal Dashboard</h1>
        <p>Here you can find personal investment information from
          <SelectField
            value={this.state.currentYear}
            style={{ bottom: -26, width: '140px', paddingLeft: '5px', font: '18px "Roboto", sans-serif', fontWeight: '500' } }
            underlineStyle={{ borderColor: '#0079c1' }}
            iconStyle={{ fill: '#0079c1' }}
            selectedMenuItemStyle={{ color: 'rgba(0, 0, 0, 0.8)'}}
            onChange={this.handleDropdownChange}
            labelStyle={this.styles}
            errorText={this.state.error}
          >
            {this.state.yearList.map(i => (
              <MenuItem
                style={{ paddingLeft: '5px', font: '18px "Roboto", sans-serif', color: 'rgba(0, 0, 0, 0.5)' } }
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
            <InvestmentDollarChart />
            <InvestmentNumberChart />
          </div>
          <div className='chart-container bar'>
            <AverageInvestmentDollarChart />
            <AverageInvestmentNumberChart />
            <SectorDollarChart />
            <SectorNumberChart />
          </div>
        </div>
      </div>
    )
  }
}