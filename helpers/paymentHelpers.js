module.exports = {
  async makePayment(wallet, user_id) {
    let result = {
      success: false,
      errorMessage: "",
      generatedTransaction: null,
    }
    return (result = {
      success: true,
      errorMessage: "",
      generatedTransaction: {
        id: Math.floor(Math.random()),
      },
    })
  },
}
