import React, { Component } from 'react'
import PremoneyValueChart from '../components/premoney-value-chart'
import { defaults } from 'react-chartjs-2';

//Set all charts to begin at Zero
defaults.scale.ticks.beginAtZero = true;

export default class IndexPage extends Component {



  render() {
    return (
      <div>
        <h1>General Dashboard</h1>
        <p>Here you can find general investment information.</p>
        <PremoneyValueChart />
      </div>
    )
  }
}