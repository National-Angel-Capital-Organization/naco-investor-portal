import React, { Component } from 'react'
import Link from 'gatsby-link'
import axios from 'axios'
import {
  Table,
  TableBody,
  TableHeader,
  TableHeaderColumn,
  TableRow,
  TableRowColumn,
} from 'material-ui/Table';
import axiosHeaders from '../axios-headers'

export default class MyExits extends Component {

  state = {
    exits: []
  }

  componentDidMount() {

    // GET EXITS

    axiosHeaders.generateHeaders().then((headers) => {
      axios('/.netlify/functions/get', {
        method: 'GET',
        headers,
        params: { path: "rest/v2/tables/IndvInvestorExits/records", userSpecific: true }
      }
      )
        .then(res => {
          this.setState({ exits: res.data.Result })
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
    const { exits } = this.state;
    return (
      <div>
        <h1>Find Exits</h1>
        <p>Search for your exits by year.</p>

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
              <TableHeaderColumn tooltip="The total dollar amount invested">Dollars Invested</TableHeaderColumn>
              <TableHeaderColumn tooltip="The Exit date">Exit Date</TableHeaderColumn>
              <TableHeaderColumn tooltip="View/edit details of your exit">Details</TableHeaderColumn>
            </TableRow>
          </TableHeader>
          <TableBody
            displayRowCheckbox={false}
            deselectOnClickaway={false}
            showRowHover={true}
            stripedRows={false}
          >
            {exits.map((row, index) => (
              <TableRow key={index}>
                <TableRowColumn>{row.IndvInvestor_ExitCompanyName}</TableRowColumn>
                <TableRowColumn>{(row.IndvInvestor_TotalInvestment).toLocaleString("en-GB", { style: 'currency', currency: 'CAD' })}</TableRowColumn>
                <TableRowColumn>{(row.IndvInvestor_ExitDate).slice(0, 10)}</TableRowColumn>
                <TableRowColumn><Link to={`/exit-details?IndvInvestor_GUID=${row.IndvInvestor_GUID}`}>View Details</Link></TableRowColumn>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    )
  }
}