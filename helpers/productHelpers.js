const categories = [
  "clothing",
  "electronics",
  "arts",
  "houses",
  "furnitures",
  "vehicles",
  "jewerly",
  "fashion",
  "games",
  "kitchen",
  "service",
  "movies",
  "gallery",
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
      nComments: product.nComments,
      blocked: product.blocked,
      createdAt: product.createdAt.toISOString(),
      updatedAt: product.updatedAt.toISOString(),
      product_media: product.product_media?.map((media) => ({
        file_format: media.file_format,
        file_name:
          media?.file_format === "image"
            ? `${process.env.BASE_URL}/wfy-media/${media?.file_name}`
            : `${process.env.BASE_URL}/wfy-media/watch?videoId=${media?.file_name}`,
      })),
    }
  },
  prizeData(data) {
    return {
      prize_id: data._id.toString(),
      owner: data.user_id,
      prize_event: data.prize_event,
      prize_amount: data.prize_amount,
      prize_amount_currency: data.prize_amount_currency,
      prized: data.prized,
      prizedAt: data.createdAt.toISOString(),
    }
  },
  requestedProductData(data) {
    return {
      request_id: data._id.toString(),
      product: data.product_id,
      requested_by: data.user_id,
      requestedAt: data.createdAt.toISOString(),
    }
  },
}
