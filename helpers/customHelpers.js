module.exports = {
  getRandomNumber(min, max) {
    return Math.trunc(Math.random() * (max - min) + min)
  },
  shuffleArray(array) {
    let currentIndex = array.length,
      randomIndex

    // While there are remaining elements to shuffle
    while (currentIndex != 0) {
      // Pick a remaining element
      randomIndex = Math.floor(Math.random() * currentIndex)
      currentIndex--

      // And swap it with the current element
      ;[array[currentIndex], array[randomIndex]] = [
        array[randomIndex],
        array[currentIndex],
      ]
    }

    return array
  },
}
