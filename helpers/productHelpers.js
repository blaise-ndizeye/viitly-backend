const categories = [
  "clothing",
  "electronic",
  "art",
  "house",
  "furniture",
  "vehicle",
  "jewerly",
  "fashion",
  "game",
  "kitchen",
  "service",
  "movie",
]

module.exports = {
  validateCategory(category) {
    const isValidCategory = categories.includes(category.toLowerCase())
    if (!isValidCategory)
      return {
        categoryError: "Category must be valid",
      }
    return { categoryError: "" }
  },
  productData(product) {
    return {
      product_id: product._id.toString(),
      owner: product.user_id,
      title: product.title,
      category: product.category,
      price: product.price,
      price_strategy: product.price_strategy,
      price_currency: product.price_currency,
      availability: product.availability,
      description: product.description,
      prized: product.prized,
      nLikes: product.nLikes,
      nComments: product.nComments,
      nShares: product.nShares,
      nViews: product.nViews,
      createdAt: product.createdAt.toISOString(),
      product_media: product.product_media.map((media) => ({
        file_name: `${process.env.BASE_URL}/${media.file_name}`,
        file_format: `${process.env.BASE_URL}/${media.file_format}`,
      })),
    }
  },
}
