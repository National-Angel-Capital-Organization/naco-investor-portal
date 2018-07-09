import React, { Component } from 'react'
import axios from 'axios'
import TextField from 'material-ui/TextField'
import DatePicker from 'material-ui/DatePicker'
import SelectField from 'material-ui/SelectField'
import MenuItem from 'material-ui/MenuItem'
import Toggle from 'material-ui/Toggle'
import RaisedButton from 'material-ui/RaisedButton'
import submissionFunctions from '../submission-functions'
import axiosHeaders from '../axios-headers'
import { navigateTo, Link } from "gatsby-link"


const provinceOptions = ['AB', 'BC', 'MB', 'NB', 'NL', 'NT', 'NS', 'NU', 'ON', 'PE', 'QC', 'SK', 'YT', 'N/A']

export default class DealDetails extends Component {

  state = {
    IndvInvestor_FullName: '',
    IndvInvestor_Email: '',
    IndvInvestor_CompanyName: '',
    IndvInvestor_CompanyWebsite: '',
    IndvInvestor_CompanyCity: '',
    IndvInvestor_CompanyProvince: '',
    IndvInvestor_DealDate: null,
    IndvInvestor_NeworFollowOn: '',
    IndvInvestor_DollarsInvested: '',
    Angel_Group_Involvement: false,
    Angel_Group_Names: [],
    Angel_Group_Other: '',
    IndvInvestor_CompanyMajorSector: '',
    IndvInvestor_CompanySector: [],
    IndvInvestor_OtherSector: '',
    IndvInvestor_Syndicated: false,
    IndvInvestor_SyndicatePartners: [],
    IndvInvestor_OtherPartners: '',
    parameters: {},
    importedLists: {
      angelGroupNames: ['Loading...'],
      angelGroupNumbers: [],
      IndvInvestorCompanySector: ['Loading...'],
      IndvInvestorCompanySectorNumbers: [],
      IndvInvestor_SyndicatePartners: ['Loading...'],
      IndvInvestor_SyndicatePartnerNumbers: []
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
      this.setState({parameters: params})
    }

    // GET DEAL DETAILS

    axiosHeaders.generateHeaders().then((headers) => {
      axios('/.netlify/functions/get', {
        method: 'GET',
        headers,
        params: { path: `rest/v2/tables/IndvInvestorDeals/records`, where: { userSpecific: true, IndvInvestor_GUID: { query: params.IndvInvestor_GUID, type: '%3D' } } }
      }
      )
        .then(res => {
          const resDeal = res.data.Result[0];
          const oldState = this.state;
          const newState = oldState;
          newState.IndvInvestor_FullName = resDeal.IndvInvestor_FullName
          newState.IndvInvestor_Email = resDeal.IndvInvestor_Email
          newState.IndvInvestor_CompanyName = resDeal.IndvInvestor_CompanyName
          newState.IndvInvestor_CompanyWebsite = resDeal.IndvInvestor_CompanyWebsite
          newState.IndvInvestor_CompanyCity = resDeal.IndvInvestor_CompanyCity
          newState.IndvInvestor_CompanyProvince = resDeal.IndvInvestor_CompanyProvince
          newState.IndvInvestor_DealDate = new Date(resDeal.IndvInvestor_DealDate)
          newState.IndvInvestor_NeworFollowOn = resDeal.IndvInvestor_NeworFollowOn
          newState.IndvInvestor_DollarsInvested = resDeal.IndvInvestor_DollarsInvested
          if (resDeal.Angel_Group_Involvement === "Yes") {
            newState.Angel_Group_Involvement = true
          } else {
            newState.Angel_Group_Involvement = false
          }

          if (resDeal.Angel_Group_Names) {
            let angelGroupNames = []
            for (let angelGroup in resDeal.Angel_Group_Names) {
              angelGroupNames.push(resDeal.Angel_Group_Names[angelGroup])
            }
            newState.Angel_Group_Names = angelGroupNames
          }
          newState.Angel_Group_Other = resDeal.Angel_Group_Other
          newState.IndvInvestor_CompanyMajorSector = resDeal.IndvInvestor_CompanyMajorSector
          if (resDeal.IndvInvestor_CompanySector) {
            let companySectors = []
            for (let sector in resDeal.IndvInvestor_CompanySector) {
              companySectors.push(resDeal.IndvInvestor_CompanySector[sector])
            }
            newState.IndvInvestor_CompanySector = companySectors
          }
          newState.IndvInvestor_OtherSector = resDeal.IndvInvestor_OtherSector
          if (resDeal.IndvInvestor_Syndicated === "Yes") {
            newState.IndvInvestor_Syndicated = true
          } else {
            newState.IndvInvestor_Syndicated = false
          }
          if (resDeal.IndvInvestor_SyndicatePartners) {
            let syndicatePartners = []
            for (let partner in resDeal.IndvInvestor_SyndicatePartners) {
              syndicatePartners.push(resDeal.IndvInvestor_SyndicatePartners[partner])
            }
            newState.IndvInvestor_SyndicatePartners = syndicatePartners
          }
          newState.IndvInvestor_OtherPartners = resDeal.IndvInvestor_OtherPartners
          this.setState(newState)
        })
        .catch(error => {
          throw error
        })
    })
      .catch(error => {
        console.log(error)
      })


    axiosHeaders.generateHeaders().then((headers) => {
      axios('/.netlify/functions/get', {
        method: 'GET',
        headers,
        params: { path: "rest/v2/tables/IndvInvestorDeals/fields/Angel_Group_Names" }
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



    axiosHeaders.generateHeaders().then((headers) => {
      axios('/.netlify/functions/get', {
        method: 'GET',
        headers,
        params: { path: "rest/v2/tables/IndvInvestorDeals/fields/IndvInvestor_CompanySector" }
      }
      )
        .then(res => {
          const sectorArray = submissionFunctions.createResponseList(res)
          submissionFunctions.moveToEndOfList('No Sector Focus', sectorArray)
          submissionFunctions.moveToEndOfList('Other (Please specify)', sectorArray)
          this.listsToState(sectorArray, 'IndvInvestorCompanySector', 'IndvInvestorCompanySectorNumbers')
        })
        .catch(error => {
          throw error
        })
    })
      .catch(error => {
        console.log(error)
      })


    // GET LIST OF COMPANY SECTORS

    axiosHeaders.generateHeaders().then((headers) => {
      axios('/.netlify/functions/get', {
        method: 'GET',
        headers,
        params: { path: "rest/v2/tables/IndvInvestorDeals/fields/IndvInvestor_CompanySector" }
      }
      )
        .then(res => {
          const sectorArray = submissionFunctions.createResponseList(res)
          submissionFunctions.moveToEndOfList('No Sector Focus', sectorArray)
          submissionFunctions.moveToEndOfList('Other (Please specify)', sectorArray)
          this.listsToState(sectorArray, 'IndvInvestorCompanySector', 'IndvInvestorCompanySectorNumbers')
        })
        .catch(error => {
          throw error
        })
    })
      .catch(error => {
        console.log(error)
      })


    // GET LIST OF SYNDICATE PARTNERS

    axiosHeaders.generateHeaders().then((headers) => {
      axios('/.netlify/functions/get', {
        method: 'GET',
        headers,
        params: { path: "rest/v2/tables/IndvInvestorDeals/fields/IndvInvestor_SyndicatePartners" }
      }
      )
        .then(res => {
          const syndicatePartnerArray = submissionFunctions.createResponseList(res)
          submissionFunctions.moveToEndOfList('Unknown', syndicatePartnerArray)
          submissionFunctions.moveToEndOfList('No Syndicate Partner', syndicatePartnerArray)
          submissionFunctions.moveToEndOfList('Others (Please Specify)', syndicatePartnerArray)
          this.listsToState(syndicatePartnerArray, 'IndvInvestor_SyndicatePartners', 'IndvInvestor_SyndicatePartnerNumbers')
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
    const error = `${name}Error`
    this.setState({ [error]: "" })
    if (value.trim() === '') {
      this.setState({ [error]: "Please enter a value." })
    }
    this.setState({ [name]: value })
  }

  handleDateChange = (event, date) => {
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

    Angel_Group_Names = submissionFunctions.findListNumber(Angel_Group_Names, this.state.importedLists.angelGroupNames, this.state.importedLists.angelGroupNumbers)
    IndvInvestor_CompanySector = submissionFunctions.findListNumber(IndvInvestor_CompanySector, this.state.importedLists.IndvInvestorCompanySector, this.state.importedLists.IndvInvestorCompanySectorNumbers)
    IndvInvestor_SyndicatePartners = submissionFunctions.findListNumber(IndvInvestor_SyndicatePartners, this.state.importedLists.IndvInvestor_SyndicatePartners, this.state.importedLists.IndvInvestor_SyndicatePartnerNumbers)
    Angel_Group_Involvement = submissionFunctions.toggleSubmit(Angel_Group_Involvement);
    IndvInvestor_Syndicated = submissionFunctions.toggleSubmit(IndvInvestor_Syndicated);

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

    axiosHeaders.generateHeaders().then((headers) => {
      axios('/.netlify/functions/put', {
        method: 'PUT',
        headers,
        data: dealSubmission,
        params: { path: "rest/v2/tables/IndvInvestorDeals/records", userSpecific: true, IndvInvestor_GUID: this.state.parameters.IndvInvestor_GUID }
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
        <h1>Your Deal Details</h1>
        <p>Update the details of your investment using the fields below.</p>
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
            errorText={this.state.IndvInvestor_FullNameError}
            value={this.state.IndvInvestor_FullName}
          />
          <br />
          <TextField
            hintText="Enter your email"
            name="IndvInvestor_Email"
            floatingLabelText="Investor Email"
            onChange={this.handleChange}
            floatingLabelFixed={true}
            style={this.styles}
            errorText={this.state.IndvInvestor_EmailError}
            value={this.state.IndvInvestor_Email}
          />
          <br />
          <TextField
            hintText="Enter the name of the investee company"
            name="IndvInvestor_CompanyName"
            floatingLabelText="Company Name"
            onChange={this.handleChange}
            floatingLabelFixed={true}
            style={this.styles}
            errorText={this.state.IndvInvestor_CompanyNameError}
            value={this.state.IndvInvestor_CompanyName}
          />
          <br />
          <TextField
            hintText="Enter the investee company's website"
            name="IndvInvestor_CompanyWebsite"
            floatingLabelText="Company Website"
            onChange={this.handleChange}
            floatingLabelFixed={true}
            style={this.styles}
            errorText={this.state.IndvInvestor_CompanyWebsiteError}
            value={this.state.IndvInvestor_CompanyWebsite}
          />
          <br />
          <TextField
            hintText="Enter the investee company's city"
            name="IndvInvestor_CompanyCity"
            floatingLabelText="Company City"
            onChange={this.handleChange}
            floatingLabelFixed={true}
            style={this.styles}
            errorText={this.state.IndvInvestor_CompanyCityError}
            value={this.state.IndvInvestor_CompanyCity}
          />
          <br />
          <SelectField
            floatingLabelFixed={true}
            floatingLabelText="Company Province"
            value={this.state.IndvInvestor_CompanyProvince}
            onChange={this.handleDropdownChange}
            style={this.styles}
            hintText="-- Select --"
            labelStyle={this.styles}
            errorText={this.state.IndvInvestor_CompanyProvinceError}
          >
            {provinceOptions.map(i => (
              <MenuItem
                key={i}
                value={i}
                primaryText={i}
                name='IndvInvestor_CompanyProvince'
              />
            ))}
          </SelectField>
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
            errorText={this.state.IndvInvestor_DealDateError}
            value={this.state.IndvInvestor_DealDate}
          />
          <SelectField
            floatingLabelFixed={true}
            floatingLabelText="New or Follow-On?"
            value={this.state.IndvInvestor_NeworFollowOn}
            onChange={this.handleDropdownChange}
            style={this.styles}
            hintText="-- Select --"
            labelStyle={this.styles}
            errorText={this.state.IndvInvestor_NeworFollowOnError}
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
            errorText={this.state.IndvInvestor_DollarsInvestedError}
            value={this.state.IndvInvestor_DollarsInvested}
          />
          <br />
          <br />
          <Toggle
            label="An Angel Group was involved in this investment"
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
            errorText={this.state.Angel_Group_NamesError}
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
            errorText={this.state.Angel_Group_OtherError}
            value={this.state.Angel_Group_Other}
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
            errorText={this.state.IndvInvestor_CompanyMajorSectorError}
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
            errorText={this.state.IndvInvestor_CompanySectorError}
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
            errorText={this.state.IndvInvestor_OtherSectorError}
            value={this.state.IndvInvestor_OtherSector}
          />

          <h2>Syndicate Partner Details</h2>
          <hr />
          <br />
          <Toggle
            label="This investment was syndicated"
            name="IndvInvestor_Syndicated"
            onToggle={this.handleToggle}
            style={this.styles}
            toggled={this.state.IndvInvestor_Syndicated}
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
            errorText={this.state.IndvInvestor_SyndicatePartnersError}
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
            errorText={this.state.IndvInvestor_OtherPartnersError}
            value={this.state.IndvInvestor_OtherPartners}
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