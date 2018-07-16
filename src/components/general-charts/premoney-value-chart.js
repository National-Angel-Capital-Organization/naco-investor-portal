import React, { Component } from 'react'
import { Bar } from 'react-chartjs-2';
import axios from 'axios'
import axiosHeaders from '../../axios-headers'
import dashboardFunctions from '../../dashboard-functions'

export default class PremoneyValueChart extends Component {

  state = {
    premoneyValueLabels: [],
    premoneyValueData: [],
    isLoading: true,
    isData: false,
  }

  fetchData = (year) => {

    // GET SUM OF PREMONEY VALUE

    axiosHeaders.generateHeaders().then((headers) => {
      axios('/.netlify/functions/get', {
        method: 'GET',
        headers,
        params: { path: "rest/v2/tables/Deals/records", select: { 0: 'Deal_MajorSector', 1: 'SUM(Deal_PremoneyValue)%20AS%20PremoneyValueSum' }, where: { Group_NameAndSubmissionYear: { query: year, type: '%20LIKE%20' } }, groupBy: 'Deal_MajorSector' }
      }
      )
        .then(res => {
          let sectors = [{ label: 'Clean Technologies', sum: 0, count: 0 }, { label: 'Energy', sum: 0, count: 0 }, { label: 'ICT', sum: 0, count: 0 }, { label: 'Life Sciences', sum: 0, count: 0 }, { label: 'Manufacturing', sum: 0, count: 0 }, { label: 'Services', sum: 0, count: 0 }];
          res.data.Result.forEach(sector => {
            switch (sector.Deal_MajorSector.toLowerCase()) {
              case sectors[0].label.toLowerCase():
                sectors[0].sum = sector.PremoneyValueSum
                break
              case sectors[1].label.toLowerCase():
                sectors[1].sum = sector.PremoneyValueSum
                break
              case sectors[2].label.toLowerCase():
                sectors[2].sum = sector.PremoneyValueSum
                break
              case sectors[3].label.toLowerCase():
                sectors[3].sum = sector.PremoneyValueSum
                break
              case sectors[4].label.toLowerCase():
                sectors[4].sum = sector.PremoneyValueSum
                break
              case sectors[5].label.toLowerCase():
                sectors[5].sum = sector.PremoneyValueSum
                break
            }
          });

          // GET COUNT OF RECORDS WITH PREMONEY VALUES
          axios('/.netlify/functions/get', {
            method: 'GET',
            headers,
            params: { path: "rest/v2/tables/Deals/records", select: { 0: 'Deal_MajorSector', 1: 'COUNT(Deal_DealRef)%20AS%20PremoneyValueCount' }, where: { Group_NameAndSubmissionYear: { query: year, type: '%20LIKE%20' }, Deal_PremoneyValue: { query: 'NULL', type: '%20IS%20NOT%20' } }, groupBy: 'Deal_MajorSector' }
          }
          )
            .then(res => {
              res.data.Result.forEach(count => {
                switch (count.Deal_MajorSector.toLowerCase()) {
                  case sectors[0].label.toLowerCase():
                    sectors[0].count = count.PremoneyValueCount
                    break
                  case sectors[1].label.toLowerCase():
                    sectors[1].count = count.PremoneyValueCount
                    break
                  case sectors[2].label.toLowerCase():
                    sectors[2].count = count.PremoneyValueCount
                    break
                  case sectors[3].label.toLowerCase():
                    sectors[3].count = count.PremoneyValueCount
                    break
                  case sectors[4].label.toLowerCase():
                    sectors[4].count = count.PremoneyValueCount
                    break
                  case sectors[5].label.toLowerCase():
                    sectors[5].count = count.PremoneyValueCount
                    break
                }
              });
              let premoneyValueLabels = []
              let premoneyValueAverage = []
              sectors.forEach(sector => {
                //SET STATE WITH LIST OF LABELS
                premoneyValueLabels.push(sector.label)
                //SET STATE WITH AVERAGE OF PREMONEY VALUE
                premoneyValueAverage.push(Math.round(sector.sum / sector.count))
              })
              this.setState({ isData: dashboardFunctions.checkForData(premoneyValueAverage)})
              this.setState({ premoneyValueLabels: premoneyValueLabels })
              this.setState({ premoneyValueData: premoneyValueAverage })
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
      labels: this.state.premoneyValueLabels,
      datasets: [{
        label: 'Valuation ($)',
        data: this.state.premoneyValueData,
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
        text: 'Valuation ($)'
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
        return (<p>No Data</p>)
      }
    }

    return (
      graphOrPlaceholder(this.state.isData, this.state.isLoading)
    )
  }

}