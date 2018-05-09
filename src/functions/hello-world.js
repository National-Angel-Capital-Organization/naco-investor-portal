export function handler(event, context, callback) {
  // console.log("this is the context: ", context)
  // console.log("this is the event: ", event)
  // // let userEmail = ''
  // // if (event.headers.host === 'localhost:8000') {
  // //   userEmail = 'bhunter@nacocanada.com'
  // // } else {
  // //   userEmail = 'troubleshooting'
  // // }
  // // console.log(userEmail)

  callback(null, {
    statusCode: 200,
    body: `Hello, world`
  });
}