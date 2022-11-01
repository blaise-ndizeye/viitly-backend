module.exports = {
  async makePayment(wallet, user_id) {
    return {
      success: true,
      errorMessage: "",
      generatedTransaction: {
        id: Math.floor(Math.random()),
      },
    }
  },
  async offerPayment({ amount, currency }, user_id) {
    return {
      success: true,
      errorMessage: "",
      generatedTransaction: {
        id: Math.floor(Math.random()),
      },
    }
  },
}
