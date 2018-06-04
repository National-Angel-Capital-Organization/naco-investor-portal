

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


  if (event.queryStringParameters) {
    path += "?q.where="
    if (event.queryStringParameters.userSpecific) {
      path += `IndvInvestor_email%3D'${userEmail}'`
      // add & to the end
    }
    for (let param in event.queryStringParameters) {
      if (param !== 'path' && param !== 'userSpecific')
      // add the params to the path with an & at the end of each
      console.log(event.queryStringParameters[param])
    }
    // trim the last & from the end
  }


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