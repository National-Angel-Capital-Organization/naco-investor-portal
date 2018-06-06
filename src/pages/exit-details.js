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
    IndvInvestor_ExitDate: null,
    IndvInvestor_ExitType: '',
    IndvInvestor_OtherExitType: '',
    Angel_Group_Involvement: false,
    Angel_Group_Names: [],
    Angel_Group_Other: '',
    IndvInvestor_InvestmentYear: '',
    IndvInvestor_InvestmentRounds: '',
    IndvInvestor_ExitROI: '',
    IndvInvestor_ExitFTE: '',
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

    let params = {}

    if (this.props.location.search) {
      let paramString = this.props.location.search
      paramString = paramString.substr(1)
      paramString = paramString.split("?")
      for (let param of paramString) {
        let paramList = param.split("=")
        params[paramList[0]] = paramList[1]
      }
    }

    // GET EXIT DETAILS

    axiosHeaders.generateHeaders().then((headers) => {
      axios('/.netlify/functions/get', {
        method: 'GET',
        headers,
        params: { path: `rest/v2/tables/IndvInvestorExits/records`, userSpecific: true, IndvInvestor_GUID: params.IndvInvestor_GUID }
      }
      )
        .then(res => {
          const resExit = res.data.Result[0];
          console.log(resExit)
          const oldState = this.state;
          const newState = oldState;
          newState.IndvInvestor_FullName = resExit.IndvInvestor_FullName
          newState.IndvInvestor_Email = resExit.IndvInvestor_Email
          newState.IndvInvestor_ExitCompanyName = resExit.IndvInvestor_ExitCompanyName
          newState.IndvInvestor_ExitType = resExit.IndvInvestor_ExitType
          newState.IndvInvestor_OtherExitType = resExit.IndvInvestor_OtherExitType
          newState.IndvInvestor_InvestmentYear = resExit.IndvInvestor_InvestmentYear
          newState.IndvInvestor_ExitDate = new Date(resExit.IndvInvestor_ExitDate)
          newState.IndvInvestor_InvestmentRounds = resExit.IndvInvestor_InvestmentRounds
          newState.IndvInvestor_ExitROI = resExit.IndvInvestor_ExitROI
          if (resExit.Angel_Group_Involvement === "Yes") {
            newState.Angel_Group_Involvement = true
          } else {
            newState.Angel_Group_Involvement = false
          }

          if (resExit.Angel_Group_Names) {
            let angelGroupNames = []
            for (let angelGroup in resExit.Angel_Group_Names) {
              angelGroupNames.push(resExit.Angel_Group_Names[angelGroup])
            }
            newState.Angel_Group_Names = angelGroupNames
          }
          newState.Angel_Group_Other = resExit.Angel_Group_Other
          newState.IndvInvestor_ExitFTE = resExit.IndvInvestor_ExitFTE
          newState.IndvInvestor_TotalInvestment = resExit.IndvInvestor_TotalInvestment
          this.setState(newState)
        })
        .catch(error => {
          throw error
        })
    })
      .catch(error => {
        console.log(error)
      })



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
    this.setState({ [name]: isInputChecked })
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
    Angel_Group_Involvement = submissionFunctions.toggleSubmit(Angel_Group_Involvement);

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

    console.log(exitSubmission)

    // axiosHeaders.generateHeaders().then((headers) => {
    //   axios('/.netlify/functions/post', {
    //     method: 'POST',
    //     headers,
    //     data: exitSubmission,
    //     params: { path: "rest/v2/tables/IndvInvestorExits/records" }
    //   }
    //   )
    //     .catch(error => {
    //       throw error
    //     })
    // })
    //   .then(() => {
    //     navigateTo('/personal-dashboard')
    //   })
    //   .catch(error => {
    //     console.log(error)
    //   })

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
            value={this.state.IndvInvestor_FullName}
          />
          <br /><TextField
            hintText="Enter your email"
            name="IndvInvestor_Email"
            floatingLabelText="Investor Email"
            onChange={this.handleChange}
            floatingLabelFixed={true}
            style={this.styles}
            value={this.state.IndvInvestor_Email}
          />
          <br /><TextField
            hintText="Enter the name of the investee company"
            name="IndvInvestor_ExitCompanyName"
            floatingLabelText="Exit Company Name"
            onChange={this.handleChange}
            floatingLabelFixed={true}
            style={this.styles}
            value={this.state.IndvInvestor_ExitCompanyName}
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
            value={this.state.IndvInvestor_ExitDate}
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
            toggled={this.state.Angel_Group_Involvement}
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
            value={this.state.Angel_Group_Other}
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
            value={this.state.IndvInvestor_InvestmentYear}
          />
          <br /><TextField
            hintText="Enter the number of investment rounds"
            name="IndvInvestor_InvestmentRounds"
            floatingLabelText="Number of Investment Rounds"
            onChange={this.handleChange}
            floatingLabelFixed={true}
            style={this.styles}
            value={this.state.IndvInvestor_InvestmentRounds}
          />
          <br /><TextField
            hintText="Enter the ROI"
            name="IndvInvestor_ExitROI"
            floatingLabelText="Return on Investment"
            onChange={this.handleChange}
            floatingLabelFixed={true}
            style={this.styles}
            value={this.state.IndvInvestor_ExitROI}
          />
          <br /><TextField
            hintText="Enter the number of full-time employees at exit"
            name="IndvInvestor_ExitFTE"
            floatingLabelText="Full-Time Employees at Exit"
            onChange={this.handleChange}
            floatingLabelFixed={true}
            style={this.styles}
            value={this.state.IndvInvestor_ExitFTE}
          />
          <br /><TextField
            hintText="Enter the total dollar amount invested"
            name="IndvInvestor_TotalInvestment"
            floatingLabelText="Total Dollars Invested"
            onChange={this.handleChange}
            floatingLabelFixed={true}
            style={this.styles}
            value={this.state.IndvInvestor_TotalInvestment}
          />
          <br />
          <br />
          <RaisedButton
            label="Update"
            primary={true}
            onClick={this.handleSubmit}
          />
        </div>
      </div>
    )
  }
}