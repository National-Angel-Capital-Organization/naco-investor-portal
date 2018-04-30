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

const syndicatePartners = [
  'Angel Groups',
  'Individual Angel Investors',
  'VC Funds',
  'Government',
  'Strategic Partner (Supplier, Buyers, Competition)',
  'Unknown',
  'Others (Please Specify)',
]

// {
//   IndvInvestor_FullName: '',
//   IndvInvestor_Email: '',
//   IndvInvestor_CompanyName: 'test',
//   IndvInvestor_CompanyWebsite: 'test.com',
//   IndvInvestor_CompanyCity: 'testville',
//   IndvInvestor_CompanyProvince: 'on',
//   IndvInvestor_CompanyMajorSector: 'ICT',
//   IndvInvestor_CompanySector: 'ICT: Unspecified',
//   IndvInvestor_OtherSector: '',
//   IndvInvestor_DealDate: '',
//   IndvInvestor_NeworFollowOn: 'New',
//   IndvInvestor_DollarsInvested: 45332,
//   IndvInvestor_Syndicated: 'No',
//   IndvInvestor_SyndicatePartners: [],
//   IndvInvestor_OtherPartners: '',
//   Angel_Group_Involvement: 'Yes',
//   Angel_Group_Names: ['Angel One', 'Anges Quebec'],
//   Angel_Group_Other: '',
//   }

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
    },
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
        let angelGroupArray = []
        for (let group in res.data.Result.ListField) {
          angelGroupArray.push({
            number: group,
            angelGroup: res.data.Result.ListField[group],
          })
        }
        angelGroupArray = angelGroupArray.sort(function(a, b) {
          var nameA = a.angelGroup.toLowerCase(),
            nameB = b.angelGroup.toLowerCase()
          if (nameA < nameB)
            //sort string ascending
            return -1
          if (nameA > nameB) return 1
          return 0 //default return value (no sorting)
        })
        let otherPosition = angelGroupArray
          .map(function(e) {
            return e.angelGroup
          })
          .indexOf('Other')
        let angelGroupArrayEnd = angelGroupArray.length - 1
        array_move(angelGroupArray, otherPosition, angelGroupArrayEnd)
        let angelGroupNames = []
        let angelGroupNumbers = []
        for (let group of angelGroupArray) {
          angelGroupNames.push(group.angelGroup)
          angelGroupNumbers.push(group.number)
        }
        const importedLists = { ...this.state.importedLists }
        importedLists.angelGroupNames = angelGroupNames
        importedLists.angelGroupNumbers = angelGroupNumbers
        this.setState({ importedLists })
      })
      .catch(error => {
        console.log(error)
      })

    axios
      .get(
        `https://${
          process.env.API_INTEGRATION_URL
        }.caspio.com/rest/v2/tables/IndvInvestor_Lists/records?q.select=Sector_Focus&q.where=DATALENGTH(Sector_Focus)%3E0%20AND%20Sector_Focus%3C%3E'No%20Sector%20Focus'%20AND%20Sector_Focus%3C%3E'Other%20(Please%20specify)'&q.groupBy=Sector_Focus&q.orderBy=Sector_Focus`,
        {
          headers: {
            accept: 'application/json',
            Authorization: `bearer ${Cookies.get('token')}`,
          },
        }
      )
      .then(res => {
        let sectorArray = []
        const sectors = res.data.Result
        for (let sector of sectors) {
          sectorArray.push(sector.Sector_Focus)
        }
        sectorArray.push('No Sector Focus', 'Other (Please specify)')
        const importedLists = { ...this.state.importedLists }
        importedLists.IndvInvestorCompanySector = sectorArray
        this.setState({ importedLists })
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
              syndicatePartners,
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
