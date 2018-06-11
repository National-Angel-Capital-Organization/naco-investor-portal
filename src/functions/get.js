

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


  if (event.queryStringParameters.select) {

    const select = JSON.parse(event.queryStringParameters.select)
    path += "?q.select="

    for (let param in select) {
      path += `${select[param]}%2C%20`
    }
    // trim the last comma from the end
    if (path.substr(path.length - 6) === '%2C%20') {
      path = path.substr(0, path.length - 6)
    }

  }


  if (event.queryStringParameters.where) {
    const where = JSON.parse(event.queryStringParameters.where)

    if (event.queryStringParameters.select) {
      path += "&q.where="
    } else {
      path += "?q.where="
    }
    // if user specific, add user email
    if (where.userSpecific) {
      path += `IndvInvestor_email%3D'${userEmail}'%20AND%20`
    }
    for (let param in where) {
      // add the params to the path with an & at the end of each
      if (param !== 'userSpecific')
        path += `${param}${where[param].type}'${where[param].query}'%20AND%20`
      console.log("PATH", path)
    }
    // trim the last & from the end
    if (path.substr(path.length - 9) === '%20AND%20') {
      path = path.substr(0, path.length - 9)
    }
  }

  if (event.queryStringParameters.groupBy) {
    path += `&q.groupBy=${event.queryStringParameters.groupBy}`
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
      console.log('ERROR', err)
      callback(null, {
        statusCode: 500,
        body: `${err}`
      });
    })
}