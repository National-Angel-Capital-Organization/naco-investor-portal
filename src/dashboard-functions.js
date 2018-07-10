const dashboardFunctions = {

  emptyToZero(value) {
    if (value === '' || value === null) {
      return 0;
    } else {
      return value;
    }
  },

  checkForData(array) {
    let data = false;
    for (let item of array) {
      if (!isNaN(item)) {
        data = true
      }
    }
    return data;
  },
}

export default dashboardFunctions;