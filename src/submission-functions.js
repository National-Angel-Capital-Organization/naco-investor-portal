

const submissionFunctions = {

  createResponseList(res) {
    let resArray = []
    for (let listItem in res.data.Result.ListField) {
      resArray.push({
        number: listItem,
        value: res.data.Result.ListField[listItem],
      })
    }
    resArray = resArray.sort(function (a, b) {
      var nameA = a.value.toLowerCase(),
        nameB = b.value.toLowerCase()
      if (nameA < nameB)
        //sort string ascending
        return -1
      if (nameA > nameB) return 1
      return 0 //default return value (no sorting)
    })
    return resArray
  },

  moveToEndOfList(listItem, array) {
    let itemPosition = array
      .map(function (e) {
        return e.value
      })
      .indexOf(listItem)
    let listEnd = array.length - 1
    this.array_move(array, itemPosition, listEnd)
  },
  array_move(arr, old_index, new_index) {
    if (new_index >= arr.length) {
      var k = new_index - arr.length + 1
      while (k--) {
        arr.push(undefined)
      }
    }
    arr.splice(new_index, 0, arr.splice(old_index, 1)[0])
    return arr // for testing
  },

  findListNumber(listNameArray, stateNames, stateNumbers) {
    let indexes = []
    let sendableListNumbers = []
    for (let listItem of listNameArray) {
      indexes.push(stateNames.indexOf(listItem))
    }
    for (let index of indexes) {
      sendableListNumbers.push(parseInt(stateNumbers[index]))
    }
    return sendableListNumbers
  },

  toggleSubmit(boolean) {
    let value = 'No'
    if (boolean) {
      value = 'Yes'
    }
    return value;
  },
}

export default submissionFunctions