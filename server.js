const { ApolloServer } = require("apollo-server-express")
const {
  ApolloServerPluginDrainHttpServer,
  ApolloServerPluginLandingPageLocalDefault,
} = require("apollo-server-core")
const { graphqlUploadExpress } = require("graphql-upload")
const express = require("express")
const http = require("http")
require("dotenv").config()

const typeDefs = require("./api/typeDefs")
const resolvers = require("./api/resolvers")
const connectDB = require("./utils/db")
const contextHandler = require("./api/context")

async function startApolloServer() {
  const app = express()

  app.use(graphqlUploadExpress({ maxFileSize: 25000000000 })) //10 files with each maximum 25MB of size
  app.use(express.static("public/uploads"))

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
    cors: {
      origin: "*",
      credentials: true,
    },
  })

  await connectDB()

  await new Promise((resolve) =>
    httpServer.listen({ port: process.env.PORT || 4000 }, resolve)
  )
  console.log("Server connection established successfully...")
}

startApolloServer()
