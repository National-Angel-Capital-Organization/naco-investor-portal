import React, { Component } from 'react'
import axios from 'axios'
import Link from 'gatsby-link'
import {
  Table,
  TableBody,
  TableHeader,
  TableHeaderColumn,
  TableRow,
  TableRowColumn,
} from 'material-ui/Table';
import axiosHeaders from '../axios-headers'


export default class MyDeals extends Component {

  state = {
    deals: []
  }

  componentDidMount() {

    // GET DEALS

    axiosHeaders.generateHeaders().then((headers) => {
      axios('/.netlify/functions/get', {
        method: 'GET',
        headers,
        params: { path: "rest/v2/tables/IndvInvestorDeals/records", userSpecific: true }
      }
      )
        .then(res => {
          this.setState({ deals: res.data.Result})
          console.log(this.state)
        })
        .catch(error => {
          throw error
        })
    })
      .catch(error => {
        console.log(error)
      })
    }

  render() {
    const { deals } = this.state;
    return (
      <div>
        <h1>Find Deals</h1>
        <p>Search for your deals by year.</p>

        <Table
          height='600px'
          fixedHeader={true}
          selectable={true}
          multiSelectable={false}
        >
          <TableHeader
            displaySelectAll={false}
            adjustForCheckbox={false}
            enableSelectAll={false}
          >
            <TableRow>
              <TableHeaderColumn tooltip="The name of the Investee Company">Company Name</TableHeaderColumn>
              <TableHeaderColumn tooltip="The dollar amount of your investment">Dollars Invested</TableHeaderColumn>
              <TableHeaderColumn tooltip="The Deal date">Deal Date</TableHeaderColumn>
              <TableHeaderColumn tooltip="Was it a new or follow-on investment?">New/Follow-On</TableHeaderColumn>
              <TableHeaderColumn tooltip="Was the deal syndicated?">Syndicated</TableHeaderColumn>
            </TableRow>
          </TableHeader>
          <TableBody
            displayRowCheckbox={false}
            deselectOnClickaway={false}
            showRowHover={true}
            stripedRows={false}
          >
            {deals.map((row, index) => (
              <TableRow key={index}>
                <TableRowColumn>{row.IndvInvestor_CompanyName}</TableRowColumn>
                <TableRowColumn>{(row.IndvInvestor_DollarsInvested).toLocaleString("en-GB",{ style: 'currency', currency: 'CAD' })}</TableRowColumn>
                <TableRowColumn>{(row.IndvInvestor_DealDate).slice(0, 10)}</TableRowColumn>
                <TableRowColumn>{row.IndvInvestor_NeworFollowOn}</TableRowColumn>
                <TableRowColumn>{row.IndvInvestor_Syndicated}</TableRowColumn>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    )
  }
}