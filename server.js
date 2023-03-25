require("dotenv").config()

const express = require("express")
const http = require("http")
const { ApolloServer } = require("apollo-server-express")
const {
  ApolloServerPluginDrainHttpServer,
  ApolloServerPluginLandingPageLocalDefault,
} = require("apollo-server-core")
const { graphqlUploadExpress } = require("graphql-upload")

const typeDefs = require("./api/typeDefs")
const resolvers = require("./api/resolvers")
const connectDB = require("./utils/db")
const contextHandler = require("./api/context")

async function startApolloServer() {
  const app = express()

  app.use(graphqlUploadExpress({ maxFileSize: 25000000000 })) // 25MB of size
  app.use("/wfy-media", require("./media"))

  const httpServer = http.createServer(app)

  const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: ({ req }) => contextHandler({ req }),
    csrfPrevention: true,
    cache: "bounded",
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

  const PORT = process.env.PORT || 4000

  await new Promise((resolve) => httpServer.listen({ port: PORT }, resolve))
  console.log(`Server connection established successfully at PORT ${PORT}...`)
}

startApolloServer()
