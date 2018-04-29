import React, { Component } from 'react'
import Link from 'gatsby-link'
import axios from 'axios'
import Cookies from 'js-cookie'
import TextField from 'material-ui/TextField'
import RaisedButton from 'material-ui/RaisedButton'

export default class SubmitDeal extends Component {
  state = {
    IndvInvestor_FullName: '',
    IndvInvestor_Email: '',
    IndvInvestor_CompanyName: '',
    IndvInvestor_CompanyWebsite: '',
    IndvInvestor_CompanyCity: '',
    IndvInvestor_CompanyProvince: '',
    IndvInvestor_DollarsInvested: '',
    Angel_Group_Other: '',
  }

  handleChange = event => {
    const target = event.target
    const value = target.type === 'checkbox' ? target.checked : target.value
    const name = target.name
    this.setState({ [name]: value })
  }

  handleSubmit = event => {
    console.log(this.state)
    event.preventDefault()
  }

  styles = {
    width: '450px',
  }

  render() {
    return (
      <div>
        <h1>Submit a Deal</h1>
        <p>Input the details of your deal using the fields below.</p>
        <div className="form-container">
          <h2>General Information</h2>
          <hr />
          <TextField
            hintText="Enter your name"
            name="IndvInvestor_FullName"
            floatingLabelText="Investor Name"
            onChange={this.handleChange}
            floatingLabelFixed={true}
            style={this.styles}
          />
          <br />
          <TextField
            hintText="Enter your email"
            name="IndvInvestor_Email"
            floatingLabelText="Investor Email"
            onChange={this.handleChange}
            floatingLabelFixed={true}
            style={this.styles}
          />
          <br />
          <TextField
            hintText="Enter the name of the investee company"
            name="IndvInvestor_CompanyName"
            floatingLabelText="Company Name"
            onChange={this.handleChange}
            floatingLabelFixed={true}
            style={this.styles}
          />
          <br />
          <TextField
            hintText="Enter the investee company's website"
            name="IndvInvestor_CompanyWebsite"
            floatingLabelText="Company Website"
            onChange={this.handleChange}
            floatingLabelFixed={true}
            style={this.styles}
          />
          <br />
          <TextField
            hintText="Enter the investee company's city"
            name="IndvInvestor_CompanyCity"
            floatingLabelText="Company City"
            onChange={this.handleChange}
            floatingLabelFixed={true}
            style={this.styles}
          />
          <br />
          <TextField
            hintText="Enter the investee company's province"
            name="IndvInvestor_CompanyProvince"
            floatingLabelText="Company Province"
            onChange={this.handleChange}
            floatingLabelFixed={true}
            style={this.styles}
          />
          <br />
          <TextField
            hintText="Enter the dollar amount invested"
            name="IndvInvestor_DollarsInvested"
            floatingLabelText="Dollars Invested"
            onChange={this.handleChange}
            floatingLabelFixed={true}
            style={this.styles}
          />
          <br />
          <TextField
            hintText="Please Specify the Angel Group name"
            name="Angel_Group_Other"
            floatingLabelText="Angel Group Name"
            onChange={this.handleChange}
            floatingLabelFixed={true}
            style={this.styles}
          />

          <h2>Company Sector Details</h2>
          <hr />

          <TextField
            hintText="If Selected 'Other (Please Specify)'"
            name="IndvInvestor_OtherSector"
            floatingLabelText="Other Sectors"
            floatingLabelFixed={true}
            style={this.styles}
          />

          <h2>Syndicate Partner Details</h2>
          <hr />

          <TextField
            hintText="If Selected 'Others (Please Specify)'"
            name="IndvInvestor_OtherPartners"
            floatingLabelText="Other Syndicate Partners"
            floatingLabelFixed={true}
            style={this.styles}
          />
          <br />
          <br />
          <RaisedButton
            label="Submit"
            primary={true}
            onClick={this.handleSubmit}
          />
        </div>
      </div>
    )
  }
}
