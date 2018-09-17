import React, { Component } from 'react'
import axios from 'axios'
import SelectField from 'material-ui/SelectField'
import MenuItem from 'material-ui/MenuItem'
import Toggle from 'material-ui/Toggle'
import { RadioButton, RadioButtonGroup } from 'material-ui/RadioButton';
import RaisedButton from 'material-ui/RaisedButton'
import TextField from 'material-ui/TextField'
import submissionFunctions from '../submission-functions'
import axiosHeaders from '../axios-headers'
import netlifyIdentity from 'netlify-identity-widget'

const provinceOptions = ['AB', 'BC', 'MB', 'NB', 'NL', 'NT', 'NS', 'NU', 'ON', 'PE', 'QC', 'SK', 'YT', 'N/A']
const geographicFocusOptions = ['No Geographic Focus', 'City Borders', 'Region Within Province', 'Provincial Borders', 'Region Spanning Multiple Provinces and/or States', 'National Borders', 'Other (Please Specify']

export default class Registration extends Component {

  state = {
    IndvInvestor_FirstName: "",
    IndvInvestor_LastName: "",
    IndvInvestor_Email: "",
    IndvInvestor_Address1: "",
    IndvInvestor_Address2: "",
    IndvInvestor_City: "",
    IndvInvestor_Province: "",
    IndvInvestor_PostCode: "",
    IndvInvestor_GeographicFocus: '',
    IndvInvestor_OtherGeograhicFocus: "",
    IndvInvestor_Gender: "",
    IndvInvestor_CustomGender: "",
    IndvInvestor_PartOfGroup: false,
    IndvInvestor_GrpMembership: [],
    IndvInvestor_GrpMembershipCustom: "",
    importedLists: {
      angelGroupNames: ['Loading...'],
      angelGroupNumbers: []
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

    this.setState({ IndvInvestor_Email: netlifyIdentity.currentUser().email })

    // GET ANGEL GROUP NAMES

    axiosHeaders.generateHeaders().then((headers) => {
      axios('/.netlify/functions/get', {
        method: 'GET',
        headers,
        params: { path: "rest/v2/tables/IndvInvestorDetails/fields/IndvInvestor_GrpMembership" }
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
    const error = `${name}Error`
    this.setState({ [error]: "" })
    if (value.trim() === '') {
      this.setState({ [error]: "Please enter a value." })
    }
    this.setState({ [name]: value })
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
      IndvInvestor_FirstName,
      IndvInvestor_LastName,
      IndvInvestor_Email,
      IndvInvestor_Address1,
      IndvInvestor_Address2,
      IndvInvestor_City,
      IndvInvestor_Province,
      IndvInvestor_PostCode,
      IndvInvestor_GeographicFocus,
      IndvInvestor_OtherGeograhicFocus,
      IndvInvestor_Gender,
      IndvInvestor_CustomGender,
      IndvInvestor_PartOfGroup,
      IndvInvestor_GrpMembership,
      IndvInvestor_GrpMembershipCustom } = this.state

    IndvInvestor_GrpMembership = submissionFunctions.findListNumber(IndvInvestor_GrpMembership, this.state.importedLists.angelGroupNames, this.state.importedLists.angelGroupNumbers)
    IndvInvestor_PartOfGroup = submissionFunctions.toggleSubmit(IndvInvestor_PartOfGroup)
    let Active = true;

    const registrationSubmission = {
      IndvInvestor_FirstName,
      IndvInvestor_LastName,
      IndvInvestor_Email,
      IndvInvestor_Address1,
      IndvInvestor_Address2,
      IndvInvestor_City,
      IndvInvestor_Province,
      IndvInvestor_PostCode,
      IndvInvestor_GeographicFocus,
      IndvInvestor_OtherGeograhicFocus,
      IndvInvestor_Gender,
      IndvInvestor_CustomGender,
      IndvInvestor_PartOfGroup,
      IndvInvestor_GrpMembership,
      IndvInvestor_GrpMembershipCustom,
      Active
    }

    axiosHeaders.generateHeaders().then((headers) => {
      axios('/.netlify/functions/post', {
        method: 'POST',
        headers,
        data: registrationSubmission,
        params: { path: "rest/v2/tables/IndvInvestorDetails/records" }
      }
      )
        .then(() => {
          if (process.env.NODE_ENV === 'development') {
            this.props.handleRegistration()
          } else {
            axios('/.netlify/functions/register-user', {
              method: 'PUT',
              headers,
              credentials: "include"
            }
            )
              .then(() => {
                this.props.handleRegistration()
              })

              .catch(error => {
                throw error
              })
          }
        })

        .catch(error => {
          throw error
        })
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

        <h1>Register</h1>
        <p>Register for full access to Angel Investment Data.</p>
        <div className="form-container">
          <h2>Personal</h2>
          <hr />
          <TextField
            hintText="Your first name"
            name="IndvInvestor_FirstName"
            floatingLabelText="First Name"
            onChange={this.handleChange}
            floatingLabelFixed={true}
            style={this.styles}
            errorText={this.state.IndvInvestor_FirstNameError}
            value={this.state.IndvInvestor_FirstName}
          />
          <br />
          <TextField
            hintText="Your last name"
            name="IndvInvestor_LastName"
            floatingLabelText="Last Name"
            onChange={this.handleChange}
            floatingLabelFixed={true}
            style={this.styles}
            errorText={this.state.IndvInvestor_LastNameError}
            value={this.state.IndvInvestor_LastName}
          />
          <br />
          <p style={{ "marginTop": "20px", "marginBottom": "12px" }}>Gender</p>
          <RadioButtonGroup
            name="IndvInvestor_Gender"
            valueSelected={this.state.IndvInvestor_Gender}
            onChange={this.handleChange}>
            <RadioButton
              value="Male"
              label="Male"
            />
            <RadioButton
              value="Female"
              label="Female"
            />
            <RadioButton
              value="Rather Not Say"
              label="Rather Not Say"
            />
            <RadioButton
              value="Other (Please Specify)"
              label="Other (Please Specify)"
            />
          </RadioButtonGroup>
          <TextField
            hintText="Please Specify Gender"
            name="IndvInvestor_CustomGender"
            floatingLabelText="Gender"
            onChange={this.handleChange}
            floatingLabelFixed={true}
            style={this.styles}
            errorText={this.state.IndvInvestor_CustomGenderError}
            value={this.state.IndvInvestor_CustomGender}
          />



          <h2>Address</h2>
          <hr />
          <TextField
            hintText="Your physical address"
            name="IndvInvestor_Address1"
            floatingLabelText="Address Line 1"
            onChange={this.handleChange}
            floatingLabelFixed={true}
            style={this.styles}
            errorText={this.state.IndvInvestor_Address1Error}
            value={this.state.IndvInvestor_Address1}
          />
          <br />
          <TextField
            hintText="Your physical address"
            name="IndvInvestor_Address2"
            floatingLabelText="Address Line 2"
            onChange={this.handleChange}
            floatingLabelFixed={true}
            style={this.styles}
            errorText={this.state.IndvInvestor_Address2Error}
            value={this.state.IndvInvestor_Address2}
          />
          <br />
          <TextField
            hintText="Your City"
            name="IndvInvestor_City"
            floatingLabelText="City"
            onChange={this.handleChange}
            floatingLabelFixed={true}
            style={this.styles}
            errorText={this.state.IndvInvestor_CityError}
            value={this.state.IndvInvestor_City}
          />
          <br />

          <SelectField
            floatingLabelFixed={true}
            floatingLabelText="Province"
            value={this.state.IndvInvestor_Province}
            onChange={this.handleDropdownChange}
            style={this.styles}
            hintText="-- Select --"
            labelStyle={this.styles}
          >
            {provinceOptions.map(i => (
              <MenuItem
                key={i}
                value={i}
                primaryText={i}
                name='IndvInvestor_Province'
              />
            ))}
          </SelectField>
          <br />
          <TextField
            hintText="Your Postal Code"
            name="IndvInvestor_PostCode"
            floatingLabelText="Postal Code"
            onChange={this.handleChange}
            floatingLabelFixed={true}
            style={this.styles}
            errorText={this.state.IndvInvestor_PostCodeError}
            value={this.state.IndvInvestor_PostCode}
          />
          <br />

          <h2>Focus / Group Membership</h2>
          <hr />

          <SelectField
            floatingLabelFixed={true}
            floatingLabelText="Geographic Focus"
            value={this.state.IndvInvestor_GeographicFocus}
            onChange={this.handleDropdownChange}
            style={this.styles}
            hintText="-- Select --"
            labelStyle={this.styles}
          >
            {geographicFocusOptions.map(i => (
              <MenuItem
                key={i}
                value={i}
                primaryText={i}
                name='IndvInvestor_GeographicFocus'
              />
            ))}
          </SelectField>

          <br />

          <TextField
            hintText="Please Specify an Area of Geographic Focus"
            name="IndvInvestor_OtherGeograhicFocus"
            floatingLabelText="Other Area of Geographic Focus"
            onChange={this.handleChange}
            floatingLabelFixed={true}
            style={this.styles}
            errorText={this.state.IndvInvestor_OtherGeograhicFocusError}
            value={this.state.IndvInvestor_OtherGeograhicFocus}
          />
          <br />
          <br />
          <Toggle
            label="Are you an Angel Group Member?"
            name="IndvInvestor_PartOfGroup"
            onToggle={this.handleToggle}
            style={this.styles}
            toggled={this.state.IndvInvestor_PartOfGroup}
          />
          <SelectField
            floatingLabelFixed={true}
            floatingLabelText="What Angel Group do you belong to?"
            value={this.state.IndvInvestor_GrpMembership}
            onChange={this.handleDropdownChange}
            style={this.styles}
            multiple={true}
            hintText="-- Select all that apply --"
            labelStyle={this.styles}
            errorText={this.state.IndvInvestor_GrpMembershipError}
          >
            {this.menuItems(
              this.state.IndvInvestor_GrpMembership,
              this.state.importedLists.angelGroupNames,
              'IndvInvestor_GrpMembership'
            )}
          </SelectField>
          <br />
          <TextField
            hintText="Please Specify the Angel Group name"
            name="IndvInvestor_GrpMembershipCustom"
            floatingLabelText="Other Angel Group Name"
            onChange={this.handleChange}
            floatingLabelFixed={true}
            style={this.styles}
            errorText={this.state.IndvInvestor_GrpMembershipCustomError}
            value={this.state.IndvInvestor_GrpMembershipCustom}
          />

          <br />
          <br />
          <RaisedButton
            label="Register"
            primary={true}
            onClick={this.handleSubmit}
          />
        </div>

      </div>
    )
  }
}