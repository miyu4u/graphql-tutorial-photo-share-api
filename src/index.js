const express = require("express")
const { ApolloServer, chainResolvers } = require("apollo-server-express")
const fs = require("fs")
const { GraphQLScalarType } = require("graphql")
const { resolve } = require("path")
const expressPlayground = require("graphql-playground-middleware-express")
require("dotenv").config()

const path = resolve(__dirname, "..", "schema", "graph.graphql")

const typeDefs = fs.readFileSync(path, { encoding: "utf8" })

const resolvers = require("./resolvers")
const { MongoClient } = require("mongodb")

async function bootstrap() {
	const app = express()
	const MONGO_DB = process.env.DB_HOST
	const client = await MongoClient.connect(MONGO_DB, { useNewUrlParser: true, useUnifiedTopology: true })
	const db = client.db()
	const context = { db }
	const server = new ApolloServer({ typeDefs, resolvers, context })
	server.applyMiddleware({ app })
	app.get("/", (req, res) => res.send("PhotoShare API에 오신것을 환영합니다"))
	app.get("/playground", expressPlayground.default({ endpoint: "/graphql" }))

	app.listen({ port: 4000 }, () => console.log(`GraphQL Service running on ${server.graphqlPath}`))
}

bootstrap()
