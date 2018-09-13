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

  let path = event.queryStringParameters.path


  axios({
    method: 'POST',
    url: `https://${process.env.API_INTEGRATION_URL}.caspio.com/${path}`,
    headers: {
      accept: 'application/json',
      Authorization: `bearer ${cookies.token}`,
    },
    data: JSON.parse(event.body),
  })
    .then(res => {
      callback(null, {
        statusCode: 200,
        body: `${JSON.stringify(res.data)}`
      });
    })
    .catch(error => {
      console.log(error)
      callback(null, {
        statusCode: 500,
        body: `${error.data.Message}`
      });
    })

}