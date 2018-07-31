

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


  // DEAL SORTING

  // VARIABLES

  const years = ['2010', '2011', '2012', '2013', '2014', '2015', '2016', '2017', '2018']
  const sectors = ['Clean Technologies', 'Energy', 'ICT', 'Life Sciences', 'Manufacturing', 'Services']

  // GROUP DEALS BY YEAR

  function groupByYear(dealArray, yearVariable) {
    return new Promise((resolve, reject) => {
      if (dealArray.length === 0) {
        reject(console.log('Error: No deals.'))
      }
      let sortedDeals = { 'unfiltered': dealArray }
      years.forEach(year => {
        let dealsFromYear = dealArray.filter(deal => {
          let dealYear = deal[yearVariable]
          dealYear = dealYear.substr(dealYear.length - 4)
          return dealYear === year
        })
        sortedDeals[year] = dealsFromYear
      })
      resolve(sortedDeals)
    })
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

  function chart(sortArray, calculation, groupedDeals) {
    let returnObject = { }
    sortArray.forEach((type) => {
      const calculatedValues = calculation(groupedDeals[type])
      returnObject[type] = calculatedValues
    })
    return returnObject
  }

  // FILTERING

  // UNFILTERED
  
  function unfiltered(finalObject, dealSorter) {
    return finalObject['unfiltered'] = dealSorter
  }

  // FILTERED BY YEAR


  // PREMONEY VALUE

  function premoneyValueCalculations(deals) {
    const sectorSumCount = sumData(deals, 'Deal_PremoneyValue')
    return sectorSumCount.sum / sectorSumCount.count
  }


  function yearFilteredPremoneyValue(finalObject, allDeals) {
    finalObject['years'] = {}
    years.forEach((year) => {
      finalObject['years'][year] = chart(sectors, premoneyValueCalculations, groupBySector(allDeals.groupDeals[year], "Deal_MajorSector"))
    })
    return finalObject
  }

  function premoneyValue(deals) {
    // Not Filtered
    let premoneyValueReturn = {}
    unfiltered(premoneyValueReturn, chart(sectors, premoneyValueCalculations, groupBySector(deals.groupDeals['unfiltered'], "Deal_MajorSector")))

    //Filtered By Year
    yearFilteredPremoneyValue(premoneyValueReturn, deals)
    
    return premoneyValueReturn
  }

  // TOTAL INVESTMENT DOLLAR

  function totalInvestmentDollar(deals) {
    // Not Filtered
    const allGroupDealsByNewFollowOn = groupByNewFollowOn(deals.groupDeals['unfiltered'], "Deal_NewOrFollowon")
    let totalInvestmentDollarReturn = { 'unfiltered': {} }
    const newSum = sumData(allGroupDealsByNewFollowOn.new, 'Deal_DollarInvested')
    totalInvestmentDollarReturn['unfiltered']['new'] = newSum.sum
    const followOnSum = sumData(allGroupDealsByNewFollowOn.followOn, 'Deal_DollarInvested')
    totalInvestmentDollarReturn['unfiltered']['followOn'] = followOnSum.sum
    // Filtered by Year
    years.forEach((year) => {
      totalInvestmentDollarReturn[year] = {}
      const yearGroupDealsByNewFollowOn = groupByNewFollowOn(deals.groupDeals[year], "Deal_NewOrFollowon")
      const newSum = sumData(yearGroupDealsByNewFollowOn.new, 'Deal_DollarInvested')
      totalInvestmentDollarReturn[year]['new'] = newSum.sum
      const followOnSum = sumData(yearGroupDealsByNewFollowOn.followOn, 'Deal_DollarInvested')
      totalInvestmentDollarReturn[year]['followOn'] = followOnSum.sum
    })
    return totalInvestmentDollarReturn
  }


// DEAL MANAGEMENT

  // GET ALL DEALS AND ADD TO ARRAYS

  function addDeals(path, pageNumber) {
    return new Promise((resolve, reject) => {
      let dealArray = []
      axios
        .get(
          `https://${process.env.API_INTEGRATION_URL}.caspio.com/rest/v2/tables/${path}&q.pageNumber=${pageNumber}`,
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
      newGroupDeals = await addDeals(`Deals/records?q.pageSize=1000`, groupPageNumber)
      newGroupDeals.forEach(element => {
        groupDeals.push(element)
      });
      groupPageNumber++
    } while (groupDeals.length % 1000 === 0 && newGroupDeals.length !== 0)

    // COLLECT INVESTOR DEALS
    do {
      newinvestorDeals = await addDeals(`IndvInvestorDeals/records?q.pageSize=1000`, investorPageNumber)
      newinvestorDeals.forEach(element => {
        investorDeals.push(element)
      });
      investorPageNumber++
    } while (investorDeals.length % 1000 === 0 && newinvestorDeals.length !== 0)
    const dealsByYear = await groupByYear(groupDeals, 'Group_NameAndSubmissionYear')
    const investorDealsByYear = await groupByYear(investorDeals, 'IndvInvestor_Email_Year')
    return ({ groupDeals: dealsByYear, investorDeals: investorDealsByYear })
  }

  // const dealsBySector = await groupBySector(groupDeals, 'Deal_MajorSector')
  // const investorDealsBySector = await groupBySector(investorDeals, 'IndvInvestor_CompanyMajorSector')
  // const dealsByNewFollowOn = await groupByNewFollowOn(groupDeals, 'Deal_NewOrFollowon')
  // const investorDealsByNewFollowOn = await groupByNewFollowOn(investorDeals, 'IndvInvestor_NeworFollowOn')
  // const groupPreMoneyValuation = await sumData(groupDeals, 'Deal_PremoneyValue')
  // console.log(groupPreMoneyValuation.sum / groupPreMoneyValuation.count)

  getAllDeals()
    .then((res) => {
      console.log(premoneyValue(res))
      console.log(totalInvestmentDollar(res))
    })
    .catch((err) => {
      throw err
    })
}







// RUN ALL FUNCTION COMBOS


// function func1() {
//   return "Number 1"
// }

// function func2() {
//   return "Number 2"
// }

// function func3() {
//   return "Number 3"
// }


// testArr = [func1, func2, func3]

// function runAllFunctions(funcArr) {
//   let newArr = []
//   funcArr.forEach((func) => {
//     newArr.push(func())
//   })
//   return newArr
// }


// var combine = function (a) {
//   var fn = function (n, src, got, all) {
//     if (n == 0) {
//       if (got.length > 0) {
//         all[all.length] = got;
//       }
//       return;
//     }
//     for (var j = 0; j < src.length; j++) {
//       fn(n - 1, src.slice(j + 1), got.concat([src[j]]), all);
//     }
//     return;
//   }
//   var all = [];
//   for (var i = 0; i < a.length; i++) {
//     fn(i, a, [], all);
//   }
//   all.push(a);
//   return all;
// }

// let allFuncs = combine(testArr)

// allFuncs.forEach((arr) => {
//   console.log(runAllFunctions(arr))
// })