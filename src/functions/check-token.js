
import axios from 'axios'

export function handler(event, context, callback) {

  if (event.headers.cookie) {
    console.log('there are cookies')
    let cookieString = event.headers.cookie
    cookieString = cookieString.split("; ")
    let cookies = {}
    for (let cookie of cookieString) {
      let splitCookie = cookie.split("=")
      cookies[splitCookie[0]] = splitCookie[1]
    }
  } else {
    console.log("there are no cookies")
  }

  console.log(`The integration url is: ${API_INTEGRATION_URL}`)

  // axios.get(
  //   `https://${process.env.API_INTEGRATION_URL}.caspio.com/rest/v2/applications`,
  //   {
  //     headers: {
  //       accept: 'application/json',
  //       Authorization: `bearer ${data.token}`,
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
    body: `Token:`
  });
}