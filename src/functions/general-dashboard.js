

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

  function objectArraySearch(objectToSearch, func) {
    if (typeof objectToSearch === 'object' && objectToSearch !== null) {
      Object.keys(objectToSearch).forEach(obj => {

        if (typeof objectToSearch[obj] === 'object' && objectToSearch[obj] !== null) {
          objectArraySearch(objectToSearch[obj], func)
        }
        if (Array.isArray(objectToSearch[obj]) && objectToSearch[obj] !== null) {
          objectToSearch[obj] = func(objectToSearch[obj])
        }
      })
    }
  }


  // CHART GENERAL FUNCTIONS

  // SUM DATA

  function sumData(dealArray, sectorVariable) {
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

  // TOTAL INVESTMENT DOLLAR

  function totalInvestmentDollar(deals) {
    const groupDealsByNewFollowOn = groupByNewFollowOn(deals, "Deal_NewOrFollowon")
    let totalInvestmentDollarReturn = {}
    const newSum = sumData(groupDealsByNewFollowOn.new, 'Deal_DollarInvested')
    totalInvestmentDollarReturn['new'] = newSum.sum
    const followOnSum = sumData(groupDealsByNewFollowOn.followOn, 'Deal_DollarInvested')
    totalInvestmentDollarReturn['followOn'] = followOnSum.sum

    return totalInvestmentDollarReturn
  }



  // FUNCTIONALITY


  getAllDeals()
    .then((res) => {
      let groupObject = res.groupDeals
      arrangeDealsObject(groupObject, dealGroupFunctionArray)
      let investorObject = res.investorDeals
      arrangeDealsObject(investorObject, dealInvestorFunctionArray)
      console.log(totalInvestmentDollar)
      objectArraySearch(groupObject, totalInvestmentDollar)
      console.log(groupObject.years)
    })
    .catch((err) => {
      throw err
    })
}














// // CHART GENERAL FUNCTIONS

// function chart(sortArray, calculation, groupedDeals) {
//   let returnObject = {}
//   sortArray.forEach((type) => {
//     const calculatedValues = calculation(groupedDeals[type])
//     returnObject[type] = calculatedValues
//   })
//   return returnObject
// }

// // FILTERING


// // UNFILTERED

// function unfiltered(finalObject, chartFunctionArray, groupFunctionArray) {
//   let sortFunction = groupFunctionArray[0]
//   let dealsToSort = groupFunctionArray[1]
//   const newObject = finalObject
//   newObject['unfiltered'] = chart(chartFunctionArray[0], chartFunctionArray[1], sortFunction(dealsToSort['unfiltered'], groupFunctionArray[2]))
//   console.log(newObject)
//   return newObject
// }

// // FILTERED BY YEAR

// function yearFiltered(finalObject, chartFunctionArray, groupFunctionArray) {
//   const newObject = finalObject
//   newObject['years'] = {}
//   let sortFunction = groupFunctionArray[0]
//   let dealsToSort = groupFunctionArray[1]
//   years.forEach((year) => {
//     newObject['years'][year] = {}
//     newObject['years'][year]['unfiltered'] = chart(chartFunctionArray[0], chartFunctionArray[1], sortFunction(dealsToSort[year], groupFunctionArray[2]))
//   })
//   console.log(newObject)
//   return newObject
// }

// // FILTERED BY PROVINCE

// function provinceFiltered(finalObject, chartFunctionArray, groupFunctionArray) {
//   const newObject = finalObject
//   newObject['provinces'] = {}
//   let sortFunction = groupFunctionArray[0]
//   let dealsToSort = groupFunctionArray[1]
//   provinces.forEach((province) => {
//     newObject['provinces'][province] = {}
//     newObject['provinces'][province]['unfiltered'] = chart(chartFunctionArray[0], chartFunctionArray[1], sortFunction(dealsToSort[province], groupFunctionArray[2]))
//   })
//   console.log(newObject)
//   return newObject
// }


// // CHART SPECIFIC FUNCTIONS

// // PREMONEY VALUE

// function premoneyValueCalculations(deals) {
//   const sectorSumCount = sumData(deals, 'Deal_PremoneyValue')
//   return sectorSumCount.sum / sectorSumCount.count
// }

// function premoneyValue(deals) {
//   let premoneyValueReturn = {}
//   // Add new filters to end of these arrays
//   const filterArray = [unfiltered, yearFiltered, provinceFiltered]
//   const dealstoFilter = [deals.years.groupDeals, deals.years.groupDeals, deals.provinces.groupDeals]
//   filterArray.forEach((filterFunction, index) => {
//     filterFunction(premoneyValueReturn, [sectors, premoneyValueCalculations], [groupBySector, dealstoFilter[index], "Deal_MajorSector"])
//   })
//   return premoneyValueReturn
// }

