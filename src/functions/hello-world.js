export function handler(event, context, callback) {
  console.log(context)
  console.log(event.headers.host)
  let userEmail = ''
  if (event.headers.host === 'localhost:8000') {
    userEmail = 'bhunter@nacocanada.com'
  } else {
    userEmail = context.clientContext.identity.user.email
  }

  callback(null, {
    statusCode: 200,
    body: `Hello, ${userEmail}`
  });
}