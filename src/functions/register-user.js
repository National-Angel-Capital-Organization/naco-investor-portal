import axios from 'axios'
require('dotenv').config()

export function handler(event, context, callback) {

  const { identity, user } = context.clientContext;

  const userID = user.sub;
  
  let userUrl = `https://determined-dijkstra-25288a.netlify.com/.netlify/identity/admin/users/${userID}`
  if (event.headers.host !== 'localhost:8000') {
    userUrl = `/.netlify/identity/admin/users/${userID}`
  }
  const adminAuthHeader = "Bearer " + identity.token;


  axios({
    method: 'PUT',
    url: userUrl,
    headers: {Authorization: adminAuthHeader},
    data: JSON.stringify({ "app_metadata": { "roles": ["registered"] } }),
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
        body: `${error}`
      });
    })

}