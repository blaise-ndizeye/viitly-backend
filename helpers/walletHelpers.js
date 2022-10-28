module.exports = {
  walletData(data) {
    return {
      wallet_id: data._id.toString(),
      price: data.price,
      currency: data.currency,
      blogs_to_offer: data.blogs_to_offer,
      products_to_offer: data.products_to_offer,
      posts_to_offer: data.posts_to_offer,
      scope: data.scope,
      createdAt: data.createdAt.toISOString(),
    }
  },
  transactionData(data) {
    return {
      transaction_id: data._id.toString(),
      provider_trans_id: data.service_provider_gen_id,
      amount_paid: data.amount_paid,
      currency_used: data.currency_used,
      description: data.description,
      transaction_role: data.transaction_role,
      createdAt: data.createdAt.toISOString(),
    }
  },
}
