

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
  const provinces = ['AB', 'BC', 'MB', 'NB', 'NL', 'NS', 'NT', 'NU', 'ON', 'PE', 'QC', 'SK', 'YT']

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

  // GROUP DEALS BY PROVINCE

  function groupByProvince(dealArray, provinceVariable) {
    let sortedDeals = {}
    provinces.forEach(province => {
      let dealsFromProvince = dealArray.filter(deal => {
        let dealProvince = deal[provinceVariable]
        return dealProvince === province
      })
      sortedDeals[province] = dealsFromProvince
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
    let returnObject = {}
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

  function yearFiltered(finalObject, chartFunctionArray, groupFunctionArray) {
    finalObject['years'] = {}
    let sortFunction = groupFunctionArray[0]
    let dealsToSort = groupFunctionArray[1]
    years.forEach((year) => {
      finalObject['years'][year] = chart(chartFunctionArray[0], chartFunctionArray[1], sortFunction(dealsToSort[year], groupFunctionArray[2]))
    })
    return finalObject
  }

  // FILTERED BY PROVINCE

  function provinceFiltered(finalObject, chartFunctionArray, groupFunctionArray) {
    finalObject['provinces'] = {}
    let sortFunction = groupFunctionArray[0]
    let dealsToSort = groupFunctionArray[1]
    provinces.forEach((province) => {
      finalObject['provinces'][province] = chart(chartFunctionArray[0], chartFunctionArray[1], sortFunction(dealsToSort[province], groupFunctionArray[2]))
    })
    return finalObject
  }


  // PREMONEY VALUE

  function premoneyValueCalculations(deals) {
    const sectorSumCount = sumData(deals, 'Deal_PremoneyValue')
    return sectorSumCount.sum / sectorSumCount.count
  }

  function premoneyValue(deals) {
    // Not Filtered
    let premoneyValueReturn = {}
    unfiltered(premoneyValueReturn, chart(sectors, premoneyValueCalculations, groupBySector(deals.years.groupDeals['unfiltered'], "Deal_MajorSector")))

    //Filtered By Year
    yearFiltered(premoneyValueReturn, [sectors, premoneyValueCalculations], [groupBySector, deals.years.groupDeals, "Deal_MajorSector"])

    // Filtered By Province 
    provinceFiltered(premoneyValueReturn, [sectors, premoneyValueCalculations], [groupBySector, deals.provinces.groupDeals, "Deal_MajorSector"])

    return premoneyValueReturn
  }

  // TOTAL INVESTMENT DOLLAR

  function totalInvestmentDollar(deals) {
    // Not Filtered
    const allGroupDealsByNewFollowOn = groupByNewFollowOn(deals.years.groupDeals['unfiltered'], "Deal_NewOrFollowon")
    let totalInvestmentDollarReturn = { 'unfiltered': {} }
    const newSum = sumData(allGroupDealsByNewFollowOn.new, 'Deal_DollarInvested')
    totalInvestmentDollarReturn['unfiltered']['new'] = newSum.sum
    const followOnSum = sumData(allGroupDealsByNewFollowOn.followOn, 'Deal_DollarInvested')
    totalInvestmentDollarReturn['unfiltered']['followOn'] = followOnSum.sum
    // Filtered by Year
    years.forEach((year) => {
      totalInvestmentDollarReturn[year] = {}
      const yearGroupDealsByNewFollowOn = groupByNewFollowOn(deals.years.groupDeals[year], "Deal_NewOrFollowon")
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
    const dealsByYear = await groupByYear(groupDeals, 'Group_NameAndSubmissionYear')
    const investorDealsByYear = await groupByYear(investorDeals, 'IndvInvestor_Email_Year')
    const dealsByProvince = await groupByProvince(groupDeals, 'Group_Province')
    const investorDealsByProvince = await groupByProvince(investorDeals, 'IndvInvestor_Province')
    return ({
      years: { groupDeals: dealsByYear, investorDeals: investorDealsByYear },
      provinces: { groupDeals: dealsByProvince, investorDeals: investorDealsByProvince }
    })
  }

  getAllDeals()
    .then((res) => {
      console.log(premoneyValue(res))
      console.log(totalInvestmentDollar(res))
    })
    .catch((err) => {
      throw err
    })
}