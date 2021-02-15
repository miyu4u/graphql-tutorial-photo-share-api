const { ApolloServer } = require("apollo-server");
const fs = require("fs");
const { GraphQLScalarType } = require("graphql");
const { resolve } = require("path");

const path = resolve(__dirname, "..", "schema", "graph.graphql");

const typeDefs = fs.readFileSync(path, { encoding: "utf8" });

var _id = 0;
var photos = [
	{
		id: "1",
		name: " name1",
		description: "desc1",
		category: "ACTION",
		githubUser: "gPlake",
		created: new Date(),
	},
	{
		id: "2",
		name: " name2",
		description: "desc2",
		category: "SELFIE",
		githubUser: "sSchmidt",
		created: new Date(),
	},
	{
		id: "3",
		name: " name1",
		description: "desc1",
		category: "LANDSCAPE",
		githubUser: "sSchmidt",
		created: new Date(),
	},
];

var users = [
	{
		githubLogin: "mHattrup",
		name: "Mike Hattrup",
	},
	{
		githubLogin: "gPlake",
		name: "Glen Plake",
	},
	{
		githubLogin: "sSchmidt",
		name: "Scot Schmidt",
	},
];

var tags = [
	{ photoID: "1", userID: "gPlake" },
	{ photoID: "2", userID: "sSchmidt" },
	{ photoID: "2", userID: "mHattrup" },
	{ photoID: "2", userID: "gPlake" },
];

const resolvers = {
	Query: {
		totalPhotos: () => photos.length,
		allPhotos: () => photos,
	},
	Mutation: {
		postPhoto(parent, args) {
			var newPhoto = {
				id: _id++,
				...args.input,
				created: new Date(),
			};
			photos.push(newPhoto);
			return newPhoto;
		},
	},
	Photo: {
		url: (parent) => `https://yoursite.com/img/${parent.id}.jpg`,
		postedBy: (parent) => {
			return users.find((u) => u.githubLogin === parent.githubUser);
		},
		taggedUsers: (parent) =>
			tags
				.filter((tag) => tag.photoID === parent.id)
				.map((tag) => tag.userID)
				.map((userID) => users.find((u) => u.githubLogin === userID)),
	},
	User: {
		postedPhotos: (parent) => {
			return photos.filter((p) => p.githubUser === parent.githubLogin);
		},
		inPhotos: (parent) =>
			tags
				.filter((tag) => tag.userID === parent.id)
				.map((tag) => tag.photoID)
				.map((photoID) => photos.find((p) => p.id === photoID)),
	},
	DateTime: new GraphQLScalarType({
		name: "DateTime",
		description: "A valid date time value",
		parseValue: (value) => new Date(value),
		serialize: (value) => new Date(value).toISOString(),
		parseLiteral: (ast) => ast.value,
	}),
};

const server = new ApolloServer({
	typeDefs,
	resolvers,
});

server.listen().then(({ url }) => console.log(`GraphQL Service running on ${url}`));
