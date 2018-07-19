

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

  // PUT DEALS IN DIFFERENT ARRAYS

  let deals = []
  let indvInvestorDeals = []


  // GET ALL DEALS AND ADD TO ARRAYS

  function addDeals(path, dealArray) {
    return new Promise((resolve, reject) => {
        axios
        .get(
          `https://${process.env.API_INTEGRATION_URL}.caspio.com/rest/v2/tables/${path}&q.pageNumber=1`,
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
          if (res.data.Result.length === 1000) {
            axios
            .get(
              `https://${process.env.API_INTEGRATION_URL}.caspio.com/rest/v2/tables/${path}&q.pageNumber=2`,
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
              if (res.data.Result.length === 1000) {
                axios
                .get(
                  `https://${process.env.API_INTEGRATION_URL}.caspio.com/rest/v2/tables/${path}&q.pageNumber=3`,
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
                  if (res.data.Result.length === 1000) {
                    axios
                    .get(
                      `https://${process.env.API_INTEGRATION_URL}.caspio.com/rest/v2/tables/${path}&q.pageNumber=4`,
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
                      reject(err)
                    })
                  } else {
                    resolve (dealArray)
                  }
                })
                .catch(err => {
                  reject(err)
                })
              } else {
                resolve (dealArray)
              }
            })
            .catch(err => {
              reject(err)
            })
          } else {
            resolve (dealArray)
          }
        })
        .catch(err => {
          reject (err)
        })     
      })
      }
      

      async function getAllDeals() {
        const groupDeals = await addDeals(`Deals/records?q.pageSize=1000`, deals)
        const investorDeals = await addDeals(`IndvInvestorDeals/records?q.pageSize=1000`, indvInvestorDeals)
        console.log(groupDeals.length)
        console.log(investorDeals.length)
      }
getAllDeals()
}