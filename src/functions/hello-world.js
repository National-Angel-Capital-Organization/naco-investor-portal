export function handler(event, context, callback) {

  let userEmail = ''
  if (event.headers.host === 'localhost:8000') {
    userEmail = 'bhunter@nacocanada.com'
  } else {
    userEmail = context.clientContext.user.email
  }

  callback(null, {
    statusCode: 200,
    body: `Hello, ${userEmail}`
  });
}