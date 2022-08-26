const { ApolloServer } = require("apollo-server-express")
const {
  ApolloServerPluginDrainHttpServer,
  ApolloServerPluginLandingPageLocalDefault,
} = require("apollo-server-core")
const express = require("express")
const http = require("http")
require("dotenv").config()

const typeDefs = require("./api/typeDefs")
const resolvers = require("./api/resolvers")
const connectDB = require("./utils/db")
const contextHandler = require("./api/context")

async function startApolloServer() {
  const app = express()

  const httpServer = http.createServer(app)

  const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: ({ req }) => contextHandler({ req }),
    csrfPrevention: true,
    plugins: [
      ApolloServerPluginDrainHttpServer({ httpServer }),
      ApolloServerPluginLandingPageLocalDefault({ embed: true }),
    ],
  })

  await server.start()
  server.applyMiddleware({
    app,
    path: "/api",
  })

  await connectDB()

  await new Promise((resolve) => httpServer.listen({ port: 4000 }, resolve))
  console.log("Server connection established successfully...")
}

startApolloServer()
