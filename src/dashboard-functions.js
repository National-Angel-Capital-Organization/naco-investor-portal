const dashboardFunctions = {

  emptyToZero(value) {
    if (value === '' || value === null) {
      return 0;
    } else {
      return value;
    }
  },
}

export default dashboardFunctions;