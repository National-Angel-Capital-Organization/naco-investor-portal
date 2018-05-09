export function handler(event, context, callback) {
  console.log(context)
  console.log(event.headers.host)
  if (event.headers.host === 'localhost:8000') {
    callback(null, {
      statusCode: 200,
      body: "Hello, LocalHost!"
    });
  } else {
    callback(null, {
      statusCode: 200,
      body: "Hello, World!"
    });
  }
}