const resolvers = {
  Query: {
    hello: () => "hello there",
  },
  Mutation: {
    mutate: () => "Am mutation",
  },
}

module.exports = resolvers
