
import axios from 'axios'
require('dotenv').config()

export function handler(event, context, callback) {

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

  axios.get(
    `https://${process.env.API_INTEGRATION_URL}.caspio.com/rest/v2/applications`,
    {
      headers: {
        accept: 'application/json',
        Authorization: `bearer ${cookies.token}`,
      }
    }
  )
  .then(res => {
    callback(null, {
      statusCode: 200,
      body: `Token Valid`
    });
  })
  .catch(err => {
    callback(null, {
      statusCode: 401,
      body: `Token Not Valid`
    });
  })


}