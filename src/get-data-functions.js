import netlifyIdentity from 'netlify-identity-widget'

const getDataFunctions = {

  generateHeaders() {
    netlifyIdentity.init()
    const headers = { "Content-Type": "application/json" };

    if (netlifyIdentity.currentUser()) {
      return netlifyIdentity.currentUser().jwt().then((token) => {
        return { ...headers, "Authorization": `Bearer ${token}` };
      })
    }
    return Promise.resolve(headers);
  },
}

export default getDataFunctions