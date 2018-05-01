import React, { Component } from 'react'
import Link from 'gatsby-link'
import axios from 'axios'
import Cookies from 'js-cookie'
import TextField from 'material-ui/TextField'
import DatePicker from 'material-ui/DatePicker'
import SelectField from 'material-ui/SelectField'
import MenuItem from 'material-ui/MenuItem'
import Toggle from 'material-ui/Toggle'
import RaisedButton from 'material-ui/RaisedButton'

function array_move(arr, old_index, new_index) {
  if (new_index >= arr.length) {
    var k = new_index - arr.length + 1
    while (k--) {
      arr.push(undefined)
    }
  }
  arr.splice(new_index, 0, arr.splice(old_index, 1)[0])
  return arr // for testing
}


export default class SubmitDeal extends Component {
  state = {
    IndvInvestor_FullName: '',
    IndvInvestor_Email: '',
    IndvInvestor_CompanyName: '',
    IndvInvestor_CompanyWebsite: '',
    IndvInvestor_CompanyCity: '',
    IndvInvestor_CompanyProvince: '',
    IndvInvestor_DealDate: '',
    IndvInvestor_NeworFollowOn: '',
    IndvInvestor_DollarsInvested: '',
    Angel_Group_Involvement: 'No',
    Angel_Group_Names: [],
    Angel_Group_Other: '',
    IndvInvestor_CompanyMajorSector: '',
    IndvInvestor_CompanySector: [],
    IndvInvestor_OtherSector: '',
    IndvInvestor_Syndicated: '',
    IndvInvestor_SyndicatePartners: [],
    IndvInvestor_OtherPartners: '',
    importedLists: {
      angelGroupNames: ['Loading...'],
      angelGroupNumbers: [],
      IndvInvestorCompanySector: ['Loading...'],
      IndvInvestorCompanySectorNumbers: [],
      IndvInvestor_SyndicatePartners: ['Loading...'],
      IndvInvestor_SyndicatePartnerNumbers: []
    },
  }

  createResponseList(res) {
    let resArray = []
    for (let listItem in res.data.Result.ListField) {
      resArray.push({
        number: listItem,
        value: res.data.Result.ListField[listItem],
      })
    }
    resArray = resArray.sort(function (a, b) {
      var nameA = a.value.toLowerCase(),
        nameB = b.value.toLowerCase()
      if (nameA < nameB)
        //sort string ascending
        return -1
      if (nameA > nameB) return 1
      return 0 //default return value (no sorting)
    })
    return resArray
  }

  moveToEndOfList(listItem, array) {
    let itemPosition = array
      .map(function (e) {
        return e.value
      })
      .indexOf(listItem)
    let listEnd = array.length - 1
    array_move(array, itemPosition, listEnd)
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
    axios
      .get(
        `https://${
        process.env.API_INTEGRATION_URL
        }.caspio.com/rest/v2/tables/IndvInvestorDeals/fields/Angel_Group_Names`,
        {
          headers: {
            accept: 'application/json',
            Authorization: `bearer ${Cookies.get('token')}`,
          },
        }
      )
      .then(res => {
        let angelGroupArray = this.createResponseList(res)
        this.moveToEndOfList('Other', angelGroupArray)
        this.listsToState(angelGroupArray, 'angelGroupNames', 'angelGroupNumbers')
      })
      .catch(error => {
        console.log(error)
      })


    axios
      .get(
        `https://${
        process.env.API_INTEGRATION_URL
        }.caspio.com/rest/v2/tables/IndvInvestorDeals/fields/IndvInvestor_CompanySector`,
        {
          headers: {
            accept: 'application/json',
            Authorization: `bearer ${Cookies.get('token')}`,
          },
        }
      )
      .then(res => {
        const sectorArray = this.createResponseList(res)
        this.moveToEndOfList('No Sector Focus', sectorArray)
        this.moveToEndOfList('Other (Please specify)', sectorArray)
        this.listsToState(sectorArray, 'IndvInvestorCompanySector', 'IndvInvestorCompanySectorNumbers')
      })
      .catch(error => {
        console.log(error)
      })


    axios
      .get(
        `https://${
        process.env.API_INTEGRATION_URL
        }.caspio.com/rest/v2/tables/IndvInvestorDeals/fields/IndvInvestor_SyndicatePartners`,
        {
          headers: {
            accept: 'application/json',
            Authorization: `bearer ${Cookies.get('token')}`,
          },
        }
      )
      .then(res => {
        const syndicatePartnerArray = this.createResponseList(res)
        this.moveToEndOfList('Unknown', syndicatePartnerArray)
        this.moveToEndOfList('No Syndicate Partner', syndicatePartnerArray)
        this.moveToEndOfList('Others (Please Specify)', syndicatePartnerArray)
        this.listsToState(syndicatePartnerArray, 'IndvInvestor_SyndicatePartners', 'IndvInvestor_SyndicatePartnerNumbers')
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

  handleDateChange = (even, date) => {
    this.setState({ IndvInvestor_DealDate: date })
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

  findListNumber(listNameArray, stateNames, stateNumbers) {
    let indexes = []
    let sendableListNumbers = []
    for (let listItem of listNameArray) {
      indexes.push(stateNames.indexOf(listItem))
    }
    for (let index of indexes) {
      sendableListNumbers.push(parseInt(stateNumbers[index]))
    }
    return sendableListNumbers
  }

  handleSubmit = event => {
    event.preventDefault()
    let {
      IndvInvestor_FullName,
      IndvInvestor_Email,
      IndvInvestor_CompanyName,
      IndvInvestor_CompanyWebsite,
      IndvInvestor_CompanyCity,
      IndvInvestor_CompanyProvince,
      IndvInvestor_CompanyMajorSector,
      IndvInvestor_CompanySector,
      IndvInvestor_OtherSector,
      IndvInvestor_DealDate,
      IndvInvestor_NeworFollowOn,
      IndvInvestor_DollarsInvested,
      IndvInvestor_Syndicated,
      IndvInvestor_SyndicatePartners,
      IndvInvestor_OtherPartners,
      Angel_Group_Involvement,
      Angel_Group_Names,
      Angel_Group_Other,
    } = this.state

    Angel_Group_Names = this.findListNumber(Angel_Group_Names, this.state.importedLists.angelGroupNames, this.state.importedLists.angelGroupNumbers)
    IndvInvestor_CompanySector = this.findListNumber(IndvInvestor_CompanySector, this.state.importedLists.IndvInvestorCompanySector, this.state.importedLists.IndvInvestorCompanySectorNumbers)
    IndvInvestor_SyndicatePartners = this.findListNumber(IndvInvestor_SyndicatePartners, this.state.importedLists.IndvInvestor_SyndicatePartners, this.state.importedLists.IndvInvestor_SyndicatePartnerNumbers)

    const dealSubmission = {
      IndvInvestor_FullName,
      IndvInvestor_Email,
      IndvInvestor_CompanyName,
      IndvInvestor_CompanyWebsite,
      IndvInvestor_CompanyCity,
      IndvInvestor_CompanyProvince,
      IndvInvestor_CompanyMajorSector,
      IndvInvestor_CompanySector,
      IndvInvestor_OtherSector,
      IndvInvestor_DealDate,
      IndvInvestor_NeworFollowOn,
      IndvInvestor_DollarsInvested,
      IndvInvestor_Syndicated,
      IndvInvestor_SyndicatePartners,
      IndvInvestor_OtherPartners,
      Angel_Group_Involvement,
      Angel_Group_Names,
      Angel_Group_Other,
    }
    console.log(dealSubmission)
    axios({
      method: 'post',
      url: `https://${process.env.API_INTEGRATION_URL}.caspio.com/rest/v2/tables/IndvInvestorDeals/records`,
      headers: {
        accept: 'application/json',
        Authorization: `bearer ${Cookies.get('token')}`,
      },
      data: dealSubmission,
    })
      .then(res => {
        console.log(res)
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
          <DatePicker
            hintText="Landscape Dialog"
            mode="landscape"
            hintText="Enter the date of the investment"
            name="IndvInvestor_DealDate"
            floatingLabelText="Deal Date"
            onChange={this.handleDateChange}
            floatingLabelFixed={true}
            textFieldStyle={this.styles}
          />
          <SelectField
            floatingLabelFixed={true}
            floatingLabelText="New or Follow-On?"
            value={this.state.IndvInvestor_NeworFollowOn}
            onChange={this.handleDropdownChange}
            style={this.styles}
            hintText="-- Select --"
            labelStyle={this.styles}
          >
            <MenuItem
              value={'New'}
              primaryText="New"
              name="IndvInvestor_NeworFollowOn"
            />
            <MenuItem
              value={'Follow-On'}
              primaryText="Follow-On"
              name="IndvInvestor_NeworFollowOn"
            />
          </SelectField>
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
          <br />
          <Toggle
            label="An Angel Group was involved in this investment"
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

          <h2>Company Sector Details</h2>
          <hr />

          <SelectField
            floatingLabelFixed={true}
            floatingLabelText="Company Predominant Sector"
            value={this.state.IndvInvestor_CompanyMajorSector}
            onChange={this.handleDropdownChange}
            style={this.styles}
            hintText="-- Select --"
            labelStyle={this.styles}
          >
            <MenuItem
              value={'Life Sciences'}
              primaryText="Life Sciences"
              name="IndvInvestor_CompanyMajorSector"
            />
            <MenuItem
              value={'ICT'}
              primaryText="ICT"
              name="IndvInvestor_CompanyMajorSector"
            />
            <MenuItem
              value={'Clean Technologies'}
              primaryText="Clean Technologies"
              name="IndvInvestor_CompanyMajorSector"
            />
            <MenuItem
              value={'Manufacturing'}
              primaryText="Manufacturing"
              name="IndvInvestor_CompanyMajorSector"
            />
            <MenuItem
              value={'Services'}
              primaryText="Services"
              name="IndvInvestor_CompanyMajorSector"
            />
            <MenuItem
              value={'Energy'}
              primaryText="Energy"
              name="IndvInvestor_CompanyMajorSector"
            />
            <MenuItem
              value={'Other'}
              primaryText="Other"
              name="IndvInvestor_CompanyMajorSector"
            />
          </SelectField>

          <br />

          <SelectField
            floatingLabelFixed={true}
            floatingLabelText="Company Sectors"
            value={this.state.IndvInvestor_CompanySector}
            onChange={this.handleDropdownChange}
            style={this.styles}
            multiple={true}
            hintText="-- Select all that apply --"
            labelStyle={this.styles}
          >
            {this.menuItems(
              this.state.IndvInvestor_CompanySector,
              this.state.importedLists.IndvInvestorCompanySector,
              'IndvInvestor_CompanySector'
            )}
          </SelectField>

          <br />
          <TextField
            hintText="If Selected 'Other (Please Specify)'"
            name="IndvInvestor_OtherSector"
            floatingLabelText="Other Sectors"
            floatingLabelFixed={true}
            style={this.styles}
            onChange={this.handleChange}
          />

          <h2>Syndicate Partner Details</h2>
          <hr />
          <br />
          <Toggle
            label="This investment was syndicated"
            name="IndvInvestor_Syndicated"
            onToggle={this.handleToggle}
            style={this.styles}
          />

          <SelectField
            floatingLabelFixed={true}
            floatingLabelText="Syndicate Partners"
            value={this.state.IndvInvestor_SyndicatePartners}
            onChange={this.handleDropdownChange}
            style={this.styles}
            multiple={true}
            hintText="-- Select all that apply --"
            labelStyle={this.styles}
          >
            {this.menuItems(
              this.state.IndvInvestor_SyndicatePartners,
              this.state.importedLists.IndvInvestor_SyndicatePartners,
              'IndvInvestor_SyndicatePartners'
            )}
          </SelectField>
          <br />
          <TextField
            hintText="If Selected 'Others (Please Specify)'"
            name="IndvInvestor_OtherPartners"
            floatingLabelText="Other Syndicate Partners"
            floatingLabelFixed={true}
            style={this.styles}
            onChange={this.handleChange}
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