

import axios from 'axios'
require('dotenv').config()

export function handler(event, context, callback) {

  let userEmail = ''
  if (event.headers.host === 'localhost:8000') {
    userEmail = 'bhunter@nacocanada.com'
  } else {
    userEmail = context.clientContext.user.email
  }

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

  let path = event.queryStringParameters.path
  if (event.queryStringParameters.userSpecific) {
    path += `?q.where=IndvInvestor_email%3D'${userEmail}'`
  }

  // if (event.queryStringParameters.params) {
  //   let params = JSON.parse(event.queryStringParameters.params)  
    // for (let param in params) {
    //   path += `?q.${param}=${params[param]}`
    // }
  // }

  axios
    .get(
      `https://${process.env.API_INTEGRATION_URL}.caspio.com/${path}`,
      {
        headers: {
          accept: 'application/json',
          Authorization: `bearer ${cookies.token}`,
        },

      }
    )
    .then(res => {
      callback(null, {
        statusCode: 200,
        body: `${JSON.stringify(res.data)}`
      });
    })
    .catch(err => {
      callback(null, {
        statusCode: 500,
        body: `${err}`
      });
    })
}