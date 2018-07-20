

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


// DEAL SORTING

// VARIABLES

const years = ['2010', '2011', '2012', '2013', '2014', '2015', '2016', '2017', '2018']


// GROUP DEALS BY YEAR

function groupByYear(dealArray, yearVariable) {
  let sortedDeals = {}
  years.forEach(year => {
    let dealsFromYear = dealArray.filter(deal => {
      let dealYear = deal[yearVariable]
      dealYear = dealYear.substr(dealYear.length - 4)
      return dealYear === year
    })
    sortedDeals[year] = dealsFromYear
  })
  return sortedDeals
}




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
            resolve (dealArray)
        })
        .catch(err => {
          reject (err)
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
        const dealsByYear = groupByYear(groupDeals, 'Group_NameAndSubmissionYear')
        const investorDealsByYear = groupByYear(investorDeals, 'IndvInvestor_Email_Year')
        console.log(investorDealsByYear)
      }
getAllDeals()
}