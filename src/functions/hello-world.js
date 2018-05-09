export function handler(event, context, callback) {
  console.log("this is the context: ", context)
  let userEmail = ''
  if (event.headers.host === 'localhost:8000') {
    userEmail = 'bhunter@nacocanada.com'
  } else {
    userEmail = 'troubleshooting'
  }

  callback(null, {
    statusCode: 200,
    body: `Hello, ${userEmail}`
  });
}