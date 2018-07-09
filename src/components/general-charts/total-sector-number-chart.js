import React, { Component } from 'react'
import { Bar } from 'react-chartjs-2';
import axios from 'axios'
import axiosHeaders from '../../axios-headers'

export default class TotalSectorNumberChart extends Component {

  state = {
    totalSectorNumberLabels: [],
    totalSectorNumberData: []
  }

  fetchData = (year) => {
    // GET COUNT OF DEAL NUMBERS

    axiosHeaders.generateHeaders().then((headers) => {
      axios('/.netlify/functions/get', {
        method: 'GET',
        headers,
        params: { path: "rest/v2/tables/Deals/records", select: { 0: 'Deal_MajorSector', 1: 'COUNT(Deal_DealRef)%20AS%20totalSectorNumber' }, where: { Group_NameAndSubmissionYear: { query: year, type: '%20LIKE%20' } }, groupBy: 'Deal_MajorSector' }
      }
      )
        .then(res => {
          let sectors = [{ label: 'Clean Technologies', totalSectorNumber: 0, indvInvestorTotalSectorNumber: 0 }, { label: 'Energy', totalSectorNumber: 0, indvInvestorTotalSectorNumber: 0 }, { label: 'ICT', totalSectorNumber: 0, indvInvestorTotalSectorNumber: 0 }, { label: 'Life Sciences', totalSectorNumber: 0, indvInvestorTotalSectorNumber: 0 }, { label: 'Manufacturing', totalSectorNumber: 0, indvInvestorTotalSectorNumber: 0 }, { label: 'Services', totalSectorNumber: 0, indvInvestorTotalSectorNumber: 0 }];
          res.data.Result.forEach(sector => {
            switch (sector.Deal_MajorSector.toLowerCase()) {
              case sectors[0].label.toLowerCase():
                sectors[0].totalSectorNumber = sector.totalSectorNumber
                break
              case sectors[1].label.toLowerCase():
                sectors[1].totalSectorNumber = sector.totalSectorNumber
                break
              case sectors[2].label.toLowerCase():
                sectors[2].totalSectorNumber = sector.totalSectorNumber
                break
              case sectors[3].label.toLowerCase():
                sectors[3].totalSectorNumber = sector.totalSectorNumber
                break
              case sectors[4].label.toLowerCase():
                sectors[4].totalSectorNumber = sector.totalSectorNumber
                break
              case sectors[5].label.toLowerCase():
                sectors[5].totalSectorNumber = sector.totalSectorNumber
                break
            }

          });

          // GET COUNT OF DEALS FROM INDIVIDUAL INVESTORS
          axios('/.netlify/functions/get', {
            method: 'GET',
            headers,
            params: { path: "rest/v2/tables/IndvInvestorDeals/records", select: { 0: 'IndvInvestor_CompanyMajorSector', 1: 'COUNT(IndvInvestor_DealRef)%20AS%20indvInvestorTotalSectorNumber' }, where: { IndvInvestor_Email_Year: { query: year, type: '%20LIKE%20' } }, groupBy: 'IndvInvestor_CompanyMajorSector' }
          }
          )
            .then(res => {
              res.data.Result.forEach(indvInvestorSector => {
                switch (indvInvestorSector.IndvInvestor_CompanyMajorSector.toLowerCase()) {
                  case sectors[0].label.toLowerCase():
                    sectors[0].indvInvestorTotalSectorNumber = indvInvestorSector.indvInvestorTotalSectorNumber
                    break
                  case sectors[1].label.toLowerCase():
                    sectors[1].indvInvestorTotalSectorNumber = indvInvestorSector.indvInvestorTotalSectorNumber
                    break
                  case sectors[2].label.toLowerCase():
                    sectors[2].indvInvestorTotalSectorNumber = indvInvestorSector.indvInvestorTotalSectorNumber
                    break
                  case sectors[3].label.toLowerCase():
                    sectors[3].indvInvestorTotalSectorNumber = indvInvestorSector.indvInvestorTotalSectorNumber
                    break
                  case sectors[4].label.toLowerCase():
                    sectors[4].indvInvestorTotalSectorNumber = indvInvestorSector.indvInvestorTotalSectorNumber
                    break
                  case sectors[5].label.toLowerCase():
                    sectors[5].indvInvestorTotalSectorNumber = indvInvestorSector.indvInvestorTotalSectorNumber
                    break
                }
              });
              let totalSectorNumberLabels = []
              let totalSectorNumberData = []
              sectors.forEach(sector => {
                //SET STATE WITH LIST OF LABELS
                totalSectorNumberLabels.push(sector.label)
                //SET STATE WITH SUM OF DEAL NUMBERS
                totalSectorNumberData.push(sector.indvInvestorTotalSectorNumber + sector.totalSectorNumber)
              })
              this.setState({ totalSectorNumberLabels: totalSectorNumberLabels })
              this.setState({ totalSectorNumberData: totalSectorNumberData })
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
      labels: this.state.totalSectorNumberLabels,
      datasets: [{
        label: 'Total Sector (#)',
        data: this.state.totalSectorNumberData,
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
    return (
      <Bar
        data={data}
        width={100}
        height={50}
      />
    )
  }

}