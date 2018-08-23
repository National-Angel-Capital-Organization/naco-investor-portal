

import axios from 'axios'
require('dotenv').config()

export function handler(event, context, callback) {

  // USER Email From Client Context
  let userEmail = ''
  if (event.headers.host === 'localhost:8000') {
    userEmail = 'bhunter@nacocanada.com'
  } else {
    userEmail = context.clientContext.user.email
  }

  // GET COOKIES
  let cookies = {}

  if (event.headers.cookie) {
    let cookieString = event.headers.cookie
    cookieString = cookieString.split("; ")
    for (let cookie of cookieString) {
      let splitCookie = cookie.split("=")
      cookies[splitCookie[0]] = splitCookie[1]
    }
  } else {
    callback(null, {
      statusCode: 401,
      body: `No Cookies`
    });
  }

  // RETRIEVE ALL DEALS FROM DATABASE WITH API CALL

  async function getAllDeals() {
    // GROUP DEAL VARIABLES
    let groupDeals = []
    let newGroupDeals = []
    let groupPageNumber = 1
    // INVESTOR DEAL VARIABLES
    let investorDeals = []
    let newinvestorDeals = []
    let investorPageNumber = 1

    // COLLECT GROUP DEALS
    do {
      newGroupDeals = await addDeals(`views/IndvInvestor_DealsCharacteristic/records?q.pageSize=1000`, groupPageNumber)
      newGroupDeals.forEach(element => {
        groupDeals.push(element)
      });
      groupPageNumber++
    } while (groupDeals.length % 1000 === 0 && newGroupDeals.length !== 0)

    // COLLECT INVESTOR DEALS
    do {
      newinvestorDeals = await addDeals(`views/IndvInvestor_DealsDetails/records?q.pageSize=1000`, investorPageNumber)
      newinvestorDeals.forEach(element => {
        investorDeals.push(element)
      });
      investorPageNumber++
    } while (investorDeals.length % 1000 === 0 && newinvestorDeals.length !== 0)

    return ({
      groupDeals: {
        unfiltered: groupDeals
      },
      investorDeals: {
        unfiltered: investorDeals
      }
    })
  }

  // DEAL SORTING

  // VARIABLES

  const years = ['2010', '2011', '2012', '2013', '2014', '2015', '2016', '2017', '2018']
  const sectors = ['Clean Technologies', 'Energy', 'ICT', 'Life Sciences', 'Manufacturing', 'Services']

  // GROUP DEALS BY YEAR

  function groupByYear(dealArray, yearVariable) {
    let sortedDeals = {}
    years.forEach(year => {
      let dealsFromYear = dealArray.filter(deal => {
        let dealYear = deal[yearVariable]
        dealYear = dealYear.substr(dealYear.length - 4)
        return dealYear === year
      })
      sortedDeals[year] = {}
      sortedDeals[year]['unfiltered'] = dealsFromYear
    })
    return sortedDeals
  }

  // GROUP DEALS BY NEW/FOLLOW-ON
  function groupByNewFollowOn(dealArray, newFollowOnVariable) {
    let sortedDeals = {}
    let newDeals = dealArray.filter(deal => {
      let dealNewOrFollowOn = deal[newFollowOnVariable]
      return dealNewOrFollowOn.toLowerCase() === 'new'
    })
    let followOnDeals = dealArray.filter(deal => {
      let dealNewOrFollowOn = deal[newFollowOnVariable]
      return dealNewOrFollowOn.toLowerCase() === 'follow-on'
    })
    sortedDeals.new = newDeals
    sortedDeals.followOn = followOnDeals
    return sortedDeals
  }

  // GROUP DEALS BY SECTOR

  function groupBySector(dealArray, sectorVariable) {
    let sortedDeals = {}
    sectors.forEach(sector => {
      let dealsFromSector = dealArray.filter(deal => {
        let dealSector = deal[sectorVariable]
        return dealSector === sector
      })
      sortedDeals[sector] = dealsFromSector
    })
    return sortedDeals
  }


  // DEAL MANAGEMENT

  // GET ALL DEALS AND ADD TO ARRAYS

  function addDeals(path, pageNumber) {
    return new Promise((resolve, reject) => {
      let dealArray = []
      axios
        .get(
          `https://${process.env.API_INTEGRATION_URL}.caspio.com/rest/v2/${path}&q.pageNumber=${pageNumber}`,
          {
            headers: {
              accept: 'application/json',
              Authorization: `bearer ${cookies.token}`,
            },
          }
        )
        .then(res => {
          res.data.Result.forEach(element => {
            dealArray.push(element)
          });
          resolve(dealArray)
        })
        .catch(err => {
          reject(err)
        })
    })
  }


  // TRAVERSE OBJECT AND APPLY FUNCTION TO FURTHER GROUP 

  function objectTraverse(objectToTraverse, sortingVariable, groupingFunction, groupingVariable) {
    if (typeof objectToTraverse === 'object' && objectToTraverse !== null) {
      Object.keys(objectToTraverse).forEach(filteredObjectType => {

        if (typeof objectToTraverse[filteredObjectType] === 'object' && filteredObjectType !== 'unfiltered' && objectToTraverse[filteredObjectType] !== null) {

          if (Object.keys(objectToTraverse[filteredObjectType]).length > 1) {
            objectTraverse(objectToTraverse[filteredObjectType], sortingVariable, groupingFunction, groupingVariable)
          }
          if (objectToTraverse[filteredObjectType].hasOwnProperty('unfiltered')) {
            objectToTraverse[filteredObjectType][sortingVariable] = groupingFunction(objectToTraverse[filteredObjectType]['unfiltered'], groupingVariable)
          }
        }
      })
      if (objectToTraverse.hasOwnProperty('unfiltered')) {
        objectToTraverse[sortingVariable] = groupingFunction(objectToTraverse['unfiltered'], groupingVariable)
      }
    }
  }


  // SEARCH OBJECT FOR ARRAYS

  function objectArraySearch(objectToSearch, func, argArray) {

    if (typeof objectToSearch === 'object' && objectToSearch !== null) {
      Object.keys(objectToSearch).forEach(obj => {

        if (typeof objectToSearch[obj] === 'object' && objectToSearch[obj] !== null) {
          objectArraySearch(objectToSearch[obj], func, argArray)
        }
        if (Array.isArray(objectToSearch[obj]) && objectToSearch[obj] !== null) {
          let newArgArray = [objectToSearch[obj], ...argArray]
          objectToSearch[obj] = func.apply(null, newArgArray)
        }
      })
    }
  }


  // CHART GENERAL FUNCTIONS

  // SUM DATA

  function sumAndCount(dealArray, sectorVariable) {
    let valueArray = []
    dealArray.forEach(deal => {
      if (deal[sectorVariable] !== null) {
        valueArray.push(deal[sectorVariable])
      }
    })
    let sumOfValues = 0
    const reducer = (accumulator, currentValue) => accumulator + currentValue
    if (valueArray.length > 0) {
      sumOfValues = valueArray.reduce(reducer)
    }
    return ({ sum: sumOfValues, count: valueArray.length })
  }


  // CHART SPECIFIC FUNCTIONS

  // AVERAGE INVESTMENT DOLLAR

  function groupAverageInvestmentAmount(deals, numberOfInvestorsVar, dollarInvestedVar) {
    const filteredDeals = deals.filter(deal => {
      return deal[dollarInvestedVar] > 0 && deal[numberOfInvestorsVar] > 0
    })
    const dollarSum = sumAndCount(filteredDeals, dollarInvestedVar)
    const memberSum = sumAndCount(filteredDeals, numberOfInvestorsVar)
    let averageInvestmentDollarReturn = { sum: dollarSum.sum, memberNumber: memberSum.sum }
    return averageInvestmentDollarReturn
  }

  function investorAverageInvestmentAmount(deals, dollarInvestedVar) {
    const userDeals = deals.filter(deal => {
      return deal['IndvInvestorDeals_IndvInvestor_Email'] === userEmail
    })
    const notUserDeals = deals.filter(deal => {
      return deal['IndvInvestorDeals_IndvInvestor_Email'] !== userEmail
        && deal['IndvInvestorDeals_IndvInvestor_Email'] !== null
        && deal['IndvInvestorDeals_IndvInvestor_Email'] !== ''
    })
    const uniqueEmails = [...new Set(notUserDeals.map(deal => deal['IndvInvestorDeals_IndvInvestor_Email']))];
    const userDollarSum = sumAndCount(userDeals, dollarInvestedVar)
    const otherDollarSum = sumAndCount(notUserDeals, dollarInvestedVar)
    return { userSum: userDollarSum.sum, otherSum: otherDollarSum.sum, memberNumber: uniqueEmails.length }
  }

  // AVERAGE INVESTMENT NUMBER

  function investorAverageInvestmentNumber(deals, emailVar) {
    const userDeals = deals.filter(deal => {
      return deal[emailVar] === userEmail
    })
    const notUserDeals = deals.filter(deal => {
      return deal[emailVar] !== userEmail
        && deal[emailVar] !== null
        && deal[emailVar] !== ''
    })
    const uniqueEmails = [...new Set(notUserDeals.map(deal => deal[emailVar]))];
    return { userNumber: userDeals.length, otherNumber: notUserDeals.length / uniqueEmails.length }
  }


  // INVESTMENT DOLLAR CHART

  function investmentDollars(deals, emailVar) {
    const userDeals = deals.filter(deal => {
      return deal[emailVar] === userEmail
    })
    let groupedUserDeals = groupByNewFollowOn(userDeals, 'IndvInvestor_NeworFollowOn')
    let userNewDollars = sumAndCount(groupedUserDeals.new, 'IndvInvestor_DollarsInvested')
    let userFollowOnDollars = sumAndCount(groupedUserDeals.followOn, 'IndvInvestor_DollarsInvested')
    return { newDollars: userNewDollars.sum, followOnDollars: userFollowOnDollars.sum }
  }

  // INVESTMENT NUMBER CHART

  function investmentNumbers(deals, emailVar) {
    const userDeals = deals.filter(deal => {
      return deal[emailVar] === userEmail
    })
    let groupedUserDeals = groupByNewFollowOn(userDeals, 'IndvInvestor_NeworFollowOn')
    let userNewNumbers = sumAndCount(groupedUserDeals.new, 'IndvInvestor_DollarsInvested')
    let userFollowOnNumbers = sumAndCount(groupedUserDeals.followOn, 'IndvInvestor_DollarsInvested')
    return { newNumbers: userNewNumbers.count, followOnNumbers: userFollowOnNumbers.count }
  }

  // SECTOR DOLLAR CHART

  function sectorDollars(deals, emailVar, dollarInvestedVar) {
    const userDeals = deals.filter(deal => {
      return deal[emailVar] === userEmail
    })
    let groupedUserDeals = groupBySector(userDeals, 'IndvInvestor_CompanyMajorSector')
    let sectorDollarReturn = {}
    for (let sector in groupedUserDeals) {
      const sectorSumCount = sumAndCount(groupedUserDeals[sector], dollarInvestedVar)
      sectorDollarReturn[sector] = sectorSumCount.sum
    }
    return sectorDollarReturn
  }

  // SECTOR NUMBER CHART

  function sectorNumbers(deals, emailVar, numberInvestedVar) {
    const userDeals = deals.filter(deal => {
      return deal[emailVar] === userEmail
    })
    let groupedUserDeals = groupBySector(userDeals, 'IndvInvestor_CompanyMajorSector')
    let sectorNumberReturn = {}
    for (let sector in groupedUserDeals) {
      const sectorSumCount = sumAndCount(groupedUserDeals[sector], numberInvestedVar)
      sectorNumberReturn[sector] = sectorSumCount.count
    }
    return sectorNumberReturn
  }




  // FUNCTIONALITY


  getAllDeals()
    .then((res) => {
      // separate group deals from investor deals and store in variables
      let groupObject = res.groupDeals
      let investorObject = res.investorDeals
      // arrange both sets of deals
      objectTraverse(groupObject, 'years', groupByYear, 'Group_NameAndSubmissionYear')
      objectTraverse(investorObject, 'years', groupByYear, 'IndvInvestor_Email_Year')
      // AVERAGE INVESTMENT DOLLAR CHART
      let groupAverageInvestmentDollar = JSON.parse(JSON.stringify(groupObject))
      objectArraySearch(groupAverageInvestmentDollar, groupAverageInvestmentAmount, ['Deal_MemberInvestors_Num', 'Deal_DollarInvested'])
      let investorAverageInvestmentDollar = JSON.parse(JSON.stringify(investorObject))
      objectArraySearch(investorAverageInvestmentDollar, investorAverageInvestmentAmount, ['IndvInvestor_DollarsInvested'])
      // AVERAGE INVESTMENT NUMBER CHART
      let investorAverageNumberOfInvestments = JSON.parse(JSON.stringify(investorObject))
      objectArraySearch(investorAverageNumberOfInvestments, investorAverageInvestmentNumber, ['IndvInvestorDeals_IndvInvestor_Email'])
      // INVESTMENT DOLLAR CHART
      let investorDollarDeals = JSON.parse(JSON.stringify(investorObject))
      objectArraySearch(investorDollarDeals, investmentDollars, ['IndvInvestorDeals_IndvInvestor_Email'])
      // INVESTMENT NUMBER CHART
      let investorNumberOfDeals = JSON.parse(JSON.stringify(investorObject))
      objectArraySearch(investorNumberOfDeals, investmentNumbers, ['IndvInvestorDeals_IndvInvestor_Email'])
      // SECTOR DOLLAR CHART
      let dealsDollarBySector = JSON.parse(JSON.stringify(investorObject))
      objectArraySearch(dealsDollarBySector, sectorDollars, ['IndvInvestorDeals_IndvInvestor_Email', 'IndvInvestor_DollarsInvested'])
      // SECTOR NUMBER CHART
      let numberOfDealsBySector = JSON.parse(JSON.stringify(investorObject))
      objectArraySearch(numberOfDealsBySector, sectorNumbers, ['IndvInvestorDeals_IndvInvestor_Email', 'IndvInvestor_DollarsInvested'])


      const objectToSend = {
        group: { averageInvestmentDollar: groupAverageInvestmentDollar },
        investor: {
          averageInvestmentDollar: investorAverageInvestmentDollar,
          averageNumberOfInvestments: investorAverageNumberOfInvestments,
          userInvestmentDollars: investorDollarDeals,
          userInvestmentNumber: investorNumberOfDeals,
          dollarsBySector: dealsDollarBySector,
          numberBySector: numberOfDealsBySector
        }
      }
      callback(null, {
        statusCode: 200,
        body: `${JSON.stringify(objectToSend)}`
      });
    })
    .catch((err) => {
      console.log('ERROR', err)
      callback(null, {
        statusCode: 500,
        body: `${err}`
      });
    })
}
