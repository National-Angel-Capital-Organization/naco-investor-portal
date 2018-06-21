import React, { Component } from 'react'
import { defaults } from 'react-chartjs-2';
import AverageInvestmentDollarChart from '../components/personal-charts/average-investment-dollar-chart'
import AverageInvestmentNumberChart from '../components/personal-charts/average-investment-number-chart'
import InvestmentDollarChart from '../components/personal-charts/investment-dollar-chart'
import InvestmentNumberChart from '../components/personal-charts/investment-number-chart'
import SectorDollarChart from '../components/personal-charts/sector-dollar-chart'
import SectorNumberChart from '../components/personal-charts/sector-number-chart'

//Set all charts to begin at Zero
defaults.scale.ticks.beginAtZero = true;


export default class PersonalDashboard extends Component {
  state = {}
  render() {
    return (
      <div>
        <h1>Personal Dashboard</h1>
        <p>Here you can find personal investment information.</p>
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