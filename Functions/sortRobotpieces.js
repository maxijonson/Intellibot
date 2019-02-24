module.exports = function(array) {
  function compare(a, b) {
    if (a.total > b.total)
      return -1;
    if (a.total < b.total)
      return 1;
    return 0;
  }

  return array.sort(compare)
}