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
}
