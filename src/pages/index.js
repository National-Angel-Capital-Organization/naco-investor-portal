import React, { Component } from 'react'
import PremoneyValueChart from '../components/general-charts/premoney-value-chart'
import TotalInvestmentNumberChart from '../components/general-charts/total-investment-number-chart'
import TotalInvestmentDollarChart from '../components/general-charts/total-investment-dollar-chart'
import TotalSectorNumberChart from '../components/general-charts/total-sector-number-chart'
import TotalSectorDollarChart from '../components/general-charts/total-sector-dollar-chart'
import { defaults } from 'react-chartjs-2';

//Set all charts to begin at Zero
defaults.scale.ticks.beginAtZero = true;

export default class IndexPage extends Component {



  render() {
    return (
      <div>
        <h1>General Dashboard</h1>
        <p>Here you can find general investment information.</p>
        <div className='chart-wrapper'>
          <div className='chart-container doughnut'>
            <TotalInvestmentNumberChart />
            <TotalInvestmentDollarChart />
          </div>
          <div className='chart-container bar'>
            <PremoneyValueChart />
            <TotalSectorNumberChart />
            <TotalSectorDollarChart />
          </div>
        </div>
      </div>
    )
  }
}