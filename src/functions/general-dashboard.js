

import axios from 'axios'
import { isNull } from 'util';
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
    const dealsByYear = groupByYear(groupDeals, 'Group_NameAndSubmissionYear')
    const investorDealsByYear = groupByYear(investorDeals, 'IndvInvestor_Email_Year')
    const dealsByProvince = groupByProvince(groupDeals, 'Group_Province')
    const investorDealsByProvince = groupByProvince(investorDeals, 'IndvInvestor_Province')
    return ({
      groupDeals: {
        unfiltered: groupDeals
      },
      investorDeals: {
        unfiltered: investorDeals,
        years: investorDealsByYear,
        provinces: investorDealsByProvince
      }
    })
  }

  // DEAL SORTING

  // VARIABLES

  const years = ['2010', '2011', '2012', '2013', '2014', '2015', '2016', '2017', '2018']
  const sectors = ['Clean Technologies', 'Energy', 'ICT', 'Life Sciences', 'Manufacturing', 'Services']
  const provinces = ['AB', 'BC', 'MB', 'NB', 'NL', 'NS', 'NT', 'NU', 'ON', 'PE', 'QC', 'SK', 'YT']

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

  // GROUP DEALS BY PROVINCE

  function groupByProvince(dealArray, provinceVariable) {
    let sortedDeals = {}
    provinces.forEach(province => {
      let dealsFromProvince = dealArray.filter(deal => {
        let dealProvince = deal[provinceVariable]
        return dealProvince === province
      })
      sortedDeals[province] = {}
      sortedDeals[province]['unfiltered'] = dealsFromProvince
    })
    return sortedDeals
  }

  // DEAL GROUP/INVESTOR FUNCTION ARRAYS

  const dealGroupFunctionArray = [{ func: groupByYear, title: 'years', groupVariable: 'Group_NameAndSubmissionYear' }, { func: groupByProvince, title: 'provinces', groupVariable: 'Group_Province' }]
  const dealInvestorFunctionArray = [{ func: groupByYear, title: 'years', groupVariable: 'IndvInvestor_Email_Year' }, { func: groupByProvince, title: 'provinces', groupVariable: 'IndvInvestor_Province' }]


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

  // LOOP THROUGH GROUPING FUNCTIONS AND APPLY TO CREATE OBJECT OF DEALS

  function arrangeDealsObject(objectToArrange, groupingArray) {
    groupingArray.forEach(groupFunction => {
      objectTraverse(objectToArrange, groupFunction.title, groupFunction.func, groupFunction.groupVariable)
    })
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

  // AVERAGE PREMONEY VALUE

  function averagePremoneyValue(deals, sectorVar, premoneyValueVar) {
    const groupDealsBySector = groupBySector(deals, sectorVar)
    let averagePremoneyValueReturn = {}
    for (let sector in groupDealsBySector) {
      const sectorSumCount = sumAndCount(groupDealsBySector[sector], premoneyValueVar)
      averagePremoneyValueReturn[sector] = sectorSumCount.sum / sectorSumCount.count
    }
    return averagePremoneyValueReturn
  }

  // TOTAL INVESTMENT DOLLAR

  function totalInvestmentDollar(deals, newFollowOnVar, dollarInvestedVar) {
    const groupDealsByNewFollowOn = groupByNewFollowOn(deals, newFollowOnVar)
    let totalInvestmentDollarReturn = {}
    const newSum = sumAndCount(groupDealsByNewFollowOn.new, dollarInvestedVar)
    totalInvestmentDollarReturn['new'] = newSum.sum
    const followOnSum = sumAndCount(groupDealsByNewFollowOn.followOn, dollarInvestedVar)
    totalInvestmentDollarReturn['followOn'] = followOnSum.sum
    return totalInvestmentDollarReturn
  }

  // TOTAL INVESTMENT NUMBER

  function totalInvestmentNumber(deals, newFollowOnVar, numberInvestedVar) {
    const groupDealsByNewFollowOn = groupByNewFollowOn(deals, newFollowOnVar)
    let totalInvestmentNumberReturn = {}
    const newSum = sumAndCount(groupDealsByNewFollowOn.new, numberInvestedVar)
    totalInvestmentNumberReturn['new'] = newSum.count
    const followOnSum = sumAndCount(groupDealsByNewFollowOn.followOn, numberInvestedVar)
    totalInvestmentNumberReturn['followOn'] = followOnSum.count
    return totalInvestmentNumberReturn
  }

  // TOTAL SECTOR DOLLAR

  function totalSectorDollar(deals, sectorVar, dollarInvestedVar) {
    const groupDealsBySector = groupBySector(deals, sectorVar)
    let totalSectorDollarReturn = {}
    for (let sector in groupDealsBySector) {
      const sectorSumCount = sumAndCount(groupDealsBySector[sector], dollarInvestedVar)
      totalSectorDollarReturn[sector] = sectorSumCount.sum
    }
    return totalSectorDollarReturn
  }

  // TOTAL SECTOR NUMBER

  function totalSectorNumber(deals, sectorVar, numberInvestedVar) {
    const groupDealsBySector = groupBySector(deals, sectorVar)
    let totalSectorNumberReturn = {}
    for (let sector in groupDealsBySector) {
      const sectorSumCount = sumAndCount(groupDealsBySector[sector], numberInvestedVar)
      totalSectorNumberReturn[sector] = sectorSumCount.count
    }
    return totalSectorNumberReturn
  }


  // FUNCTIONALITY


  getAllDeals()
    .then((res) => {
      // separate group deals from investor deals and store in variables
      let groupObject = res.groupDeals
      let investorObject = res.investorDeals
      // arrange both sets of deals
      arrangeDealsObject(groupObject, dealGroupFunctionArray)
      arrangeDealsObject(investorObject, dealInvestorFunctionArray)
      // AVERAGE PREMONEY VALUE CHART
      let groupAveragePremoneyValue = JSON.parse(JSON.stringify(groupObject))
      objectArraySearch(groupAveragePremoneyValue, averagePremoneyValue, ["Deal_MajorSector", 'Deal_PremoneyValue'])
      // TOTAL INVESTMENT DOLLAR CHART
      let groupTotalInvestmentDollar = JSON.parse(JSON.stringify(groupObject))
      objectArraySearch(groupTotalInvestmentDollar, totalInvestmentDollar, ["Deal_NewOrFollowon", 'Deal_DollarInvested'])
      let investorTotalInvestmentDollar = JSON.parse(JSON.stringify(investorObject))
      objectArraySearch(investorTotalInvestmentDollar, totalInvestmentDollar, ["IndvInvestor_NeworFollowOn", 'IndvInvestor_DollarsInvested'])
      // TOTAL INVESTMENT NUMBER CHART
      let groupTotalInvestmentNumber = JSON.parse(JSON.stringify(groupObject))
      objectArraySearch(groupTotalInvestmentNumber, totalInvestmentNumber, ["Deal_NewOrFollowon", 'Deal_DollarInvested'])
      let investorTotalInvestmentNumber = JSON.parse(JSON.stringify(investorObject))
      objectArraySearch(investorTotalInvestmentNumber, totalInvestmentNumber, ["IndvInvestor_NeworFollowOn", 'IndvInvestor_DollarsInvested'])
      // TOTAL SECTOR DOLLAR CHART
      let groupTotalSectorDollar = JSON.parse(JSON.stringify(groupObject))
      objectArraySearch(groupTotalSectorDollar, totalSectorDollar, ["Deal_MajorSector", 'Deal_DollarInvested'])
      let investorTotalSectorDollar = JSON.parse(JSON.stringify(investorObject))
      objectArraySearch(investorTotalSectorDollar, totalSectorDollar, ["IndvInvestor_CompanyMajorSector", 'IndvInvestor_DollarsInvested'])
      // TOTAL SECTOR NUMBER CHART
      let groupTotalSectorNumber = JSON.parse(JSON.stringify(groupObject))
      objectArraySearch(groupTotalSectorNumber, totalSectorNumber, ["Deal_MajorSector", 'Deal_DollarInvested'])
      let investorTotalSectorNumber = JSON.parse(JSON.stringify(investorObject))
      objectArraySearch(investorTotalSectorNumber, totalSectorNumber, ["IndvInvestor_CompanyMajorSector", 'IndvInvestor_DollarsInvested'])
    })
    .catch((err) => {
      throw err
    })
}
