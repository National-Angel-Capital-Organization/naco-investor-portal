
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
    console.log("there are no cookies")
  }
  console.log(process.env.API_INTEGRATION_URL)

  // axios.get(
  //   `https://${process.env.API_INTEGRATION_URL}.caspio.com/rest/v2/applications`,
  //   {
  //     headers: {
  //       accept: 'application/json',
  //       Authorization: `bearer ${cookies.token}`,
  //     }
  //   }
  // )
  // .then(res => {
  //   console.log(res)
  // })
  // .catch(err => {
  //   console.log(err)
  // })

  callback(null, {
    statusCode: 200,
    body: `Token: ${cookies.token} io: ${cookies.io}`
  });
}