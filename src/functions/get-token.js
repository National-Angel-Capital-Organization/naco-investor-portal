
import axios from 'axios'
require('dotenv').config()

export function handler(event, context, callback) {

  axios.post(
    `${process.env.API_AUTH_URL}`,
    `grant_type=client_credentials&client_id=${
    process.env.API_CLIENT_ID
    }&client_secret=${process.env.API_CLIENT_SECRET}`
  )
    .then(res => {
      callback(null, {
        statusCode: 200,
        body: `${res.data.access_token}`
      });
    })
    .catch(err => {
      callback(null, {
        statusCode: 500,
        body: `${err}`
      });
    })
}