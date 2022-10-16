module.exports = {
  getRandomNumber(min, max) {
    return Math.trunc(Math.random() * (max - min) + min)
  },
}
