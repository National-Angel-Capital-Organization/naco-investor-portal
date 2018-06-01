import React, { Component } from 'react'
import axios from 'axios'
import Cookies from 'js-cookie'
import TextField from 'material-ui/TextField'
import DatePicker from 'material-ui/DatePicker'
import SelectField from 'material-ui/SelectField'
import MenuItem from 'material-ui/MenuItem'
import Toggle from 'material-ui/Toggle'
import RaisedButton from 'material-ui/RaisedButton'
import submissionFunctions from '../submission-functions'
import axiosHeaders from '../axios-headers'
import { navigateTo, Link } from "gatsby-link"

const exitTypes = [
  'Sale to / Merger with another company', 
  'Sale to new shareholders', 
  'Company ceased operations', 
  'Sale to other existing shareholders', 
  'IPO', 
  'Unknown', 
  'Other'
]

export default class SubmitExit extends Component {

  state = {
    IndvInvestor_FullName: '',
    IndvInvestor_Email: '',
    IndvInvestor_ExitCompanyName: '',
    IndvInvestor_ExitDate: '',
    IndvInvestor_ExitType: '',
    IndvInvestor_OtherExitType: '',
    Angel_Group_Involvement: 'No',
    Angel_Group_Names: [],
    Angel_Group_Other: '',
    IndvInvestor_InvestmentYear: null,
    IndvInvestor_InvestmentRounds: null,
    IndvInvestor_ExitROI: null,
    IndvInvestor_ExitFTE: null,
    IndvInvestor_TotalInvestment: '',
    importedLists: {
      angelGroupNames: ['Loading...'],
      angelGroupNumbers: [],
    },
  }

  listsToState(originalList, stateName, stateNumber) {
    let listNames = []
    let listNumbers = []
    for (let listItem of originalList) {
      listNames.push(listItem.value)
      listNumbers.push(listItem.number)
    }
    const importedLists = { ...this.state.importedLists }
    importedLists[stateName] = listNames
    importedLists[stateNumber] = listNumbers
    this.setState({ importedLists })
  }

  componentDidMount() {



    // GET LIST OF ANGEL GROUPS

    axiosHeaders.generateHeaders().then((headers) => {
      axios('/.netlify/functions/get', {
        method: 'GET',
        headers,
        params: { path: "rest/v2/tables/IndvInvestorExits/fields/Angel_Group_Names" }
      }
      )
        .then(res => {
          let angelGroupArray = submissionFunctions.createResponseList(res)
          submissionFunctions.moveToEndOfList('Other', angelGroupArray)
          this.listsToState(angelGroupArray, 'angelGroupNames', 'angelGroupNumbers')
        })
        .catch(error => {
          throw error
        })
    })
      .catch(error => {
        console.log(error)
      })
  }

  handleDropdownChange = (event, index, value) => {
    const target = event.target
    const name = target.parentNode.parentNode.parentNode.attributes[0].nodeValue
    this.setState({ [name]: value })
  }

  handleToggle = (event, isInputChecked) => {
    const name = event.target.name
    let value = 'No'
    if (isInputChecked) {
      value = 'Yes'
    }
    this.setState({ [name]: value })
  }

  handleChange = event => {
    const target = event.target
    const value = target.type === 'checkbox' ? target.checked : target.value
    const name = target.name
    this.setState({ [name]: value })
  }

  handleDateChange = (event, date) => {
    this.setState({ IndvInvestor_ExitDate: date })
  }

  menuItems(values, array, menuName) {
    return array.map(i => (
      <MenuItem
        key={i}
        insetChildren={true}
        checked={values && values.indexOf(i) > -1}
        value={i}
        primaryText={i}
        name={menuName}
      />
    ))
  }

  handleSubmit = event => {
    event.preventDefault()
    let {
      IndvInvestor_FullName,
      IndvInvestor_Email,
      IndvInvestor_ExitCompanyName,
      IndvInvestor_ExitDate,
      IndvInvestor_ExitType,
      IndvInvestor_OtherExitType,
      Angel_Group_Involvement,
      Angel_Group_Names,
      Angel_Group_Other,
      IndvInvestor_InvestmentYear,
      IndvInvestor_InvestmentRounds,
      IndvInvestor_ExitROI,
      IndvInvestor_ExitFTE,
      IndvInvestor_TotalInvestment,
    } = this.state

    Angel_Group_Names = submissionFunctions.findListNumber(Angel_Group_Names, this.state.importedLists.angelGroupNames, this.state.importedLists.angelGroupNumbers)

    const exitSubmission = {
      IndvInvestor_FullName,
      IndvInvestor_Email,
      IndvInvestor_ExitCompanyName,
      IndvInvestor_ExitDate,
      IndvInvestor_ExitType,
      IndvInvestor_OtherExitType,
      Angel_Group_Involvement,
      Angel_Group_Names,
      Angel_Group_Other,
      IndvInvestor_InvestmentYear,
      IndvInvestor_InvestmentRounds,
      IndvInvestor_ExitROI,
      IndvInvestor_ExitFTE,
      IndvInvestor_TotalInvestment,
    }

    
    axiosHeaders.generateHeaders().then((headers) => {
      axios('/.netlify/functions/post', {
        method: 'POST',
        headers,
        data: exitSubmission,
        params: { path: "rest/v2/tables/IndvInvestorExits/records" }
      }
      )
        .catch(error => {
          throw error
        })
    })
      .then(() => {
        navigateTo('/personal-dashboard')
      })
      .catch(error => {
        console.log(error)
      })

  }

  styles = {
    width: '450px',
  }

  render() {
    return (
      <div>
        <h1>Submit an Exit</h1>
        <p>Input the details of your exit using the fields below.</p>
        <div className="form-container">
          <h2>General Information</h2>
          <hr />
          <TextField
            hintText="Enter your full name"
            name="IndvInvestor_FullName"
            floatingLabelText="Investor Name"
            onChange={this.handleChange}
            floatingLabelFixed={true}
            style={this.styles}
          />
          <br /><TextField
            hintText="Enter your email"
            name="IndvInvestor_Email"
            floatingLabelText="Investor Email"
            onChange={this.handleChange}
            floatingLabelFixed={true}
            style={this.styles}
          />
          <br /><TextField
            hintText="Enter the name of the investee company"
            name="IndvInvestor_ExitCompanyName"
            floatingLabelText="Exit Company Name"
            onChange={this.handleChange}
            floatingLabelFixed={true}
            style={this.styles}
          />
          <br />
          <DatePicker
            hintText="Landscape Dialog"
            mode="landscape"
            hintText="Enter the date of the exit"
            name="IndvInvestor_ExitDate"
            floatingLabelText="Exit Date"
            onChange={this.handleDateChange}
            floatingLabelFixed={true}
            textFieldStyle={this.styles}
          />
          <SelectField
            floatingLabelFixed={true}
            floatingLabelText="Exit Type"
            value={this.state.IndvInvestor_ExitType}
            onChange={this.handleDropdownChange}
            style={this.styles}
            hintText="-- Select --"
            labelStyle={this.styles}
          >
            {exitTypes.map(i => (
              <MenuItem
                key={i}
                value={i}
                primaryText={i}
                name='IndvInvestor_ExitType'
              />
            ))}
          </SelectField>
          <br />
          <br />
          <Toggle
            label="An Angel Group was involved with this investment."
            name="Angel_Group_Involvement"
            onToggle={this.handleToggle}
            style={this.styles}
          />
          <SelectField
            floatingLabelFixed={true}
            floatingLabelText="Names of the Angel Groups Involved"
            value={this.state.Angel_Group_Names}
            onChange={this.handleDropdownChange}
            style={this.styles}
            multiple={true}
            hintText="-- Select all that apply --"
            labelStyle={this.styles}
          >
            {this.menuItems(
              this.state.Angel_Group_Names,
              this.state.importedLists.angelGroupNames,
              'Angel_Group_Names'
            )}
          </SelectField>
          <br />
          <TextField
            hintText="Please Specify the Angel Group name"
            name="Angel_Group_Other"
            floatingLabelText="Angel Group Name"
            onChange={this.handleChange}
            floatingLabelFixed={true}
            style={this.styles}
          />
          <br />
          <h2>Details</h2>
          <hr />
          <TextField
            hintText="Enter the initial year of investment"
            name="IndvInvestor_InvestmentYear"
            floatingLabelText="Original Investment Year"
            onChange={this.handleChange}
            floatingLabelFixed={true}
            style={this.styles}
          />
          <br /><TextField
            hintText="Enter the number of investment rounds"
            name="IndvInvestor_InvestmentRounds"
            floatingLabelText="Number of Investment Rounds"
            onChange={this.handleChange}
            floatingLabelFixed={true}
            style={this.styles}
          />
          <br /><TextField
            hintText="Enter the ROI"
            name="IndvInvestor_ExitROI"
            floatingLabelText="Return on Investment"
            onChange={this.handleChange}
            floatingLabelFixed={true}
            style={this.styles}
          />
          <br /><TextField
            hintText="Enter the number of full-time employees at exit"
            name="IndvInvestor_ExitFTE"
            floatingLabelText="Full-Time Employees at Exit"
            onChange={this.handleChange}
            floatingLabelFixed={true}
            style={this.styles}
          />
          <br /><TextField
            hintText="Enter the total dollar amount invested"
            name="IndvInvestor_TotalInvestment"
            floatingLabelText="Total Dollars Invested"
            onChange={this.handleChange}
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