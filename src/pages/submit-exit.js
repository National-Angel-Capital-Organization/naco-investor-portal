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


export default class SubmitExit extends Component {

  state = {
    IndvInvestor_FullName: '',
    IndvInvestor_Email: '',
    IndvInvestor_ExitCompanyName: '',
    IndvInvestor_ExitDate: '',
    IndvInvestor_ExitType: '',
    IndvInvestor_OtherExitType: '',
    Angel_Group_Involvement:  'No',
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


  render() {
    return (
      <div>
        <h1>Submit an Exit</h1>
        <p>Input the details of your exit using the fields below.</p>
      </div>
    )
  }
}