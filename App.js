const express = require("express");
const { ApolloServer, gql } = require("apollo-server-express");
const mongoose = require("mongoose");

const app = express();

mongoose.connect(
  "mongodb+srv://kiruba1997:kiruba1997@cluster0.seblfml.mongodb.net/",
  { useNewUrlParser: true }
);
mongoose.connection.once("open", () => {
  console.log("connected to database");
});

const typeDefs = gql`
  type Book {
    id: ID
    name: String
    genre: String
    author: Author
  }

  type Author {
    id: ID
    name: String
    age: Int
    books: [Book]
  }

  type Query {
    book(id: ID!): Book
    author(id: ID!): Author
    books: [Book]
    authors: [Author]
  }

  type Mutation {
    addAuthor(name: String!, age: Int!): Author
    addBook(name: String!, genre: String!, authorId: ID!): Book
  }
`;

const resolvers = {
  Query: {
    book: (parent, args) => Book.findById(args.id),
    author: (parent, args) => Author.findById(args.id),
    books: () => Book.find({}),
    authors: () => Author.find({}),
  },
  Author: {
    books: (parent) => Book.find({ authorId: parent.id }),
  },
  Mutation: {
    addAuthor: (parent, args) => {
      let author = new Author({
        name: args.name,
        age: args.age,
      });
      return author.save();
    },
    addBook: (parent, args) => {
      let book = new Book({
        name: args.name,
        genre: args.genre,
        authorId: args.authorId,
      });
      return book.save();
    },
  },
};

const server = new ApolloServer({ typeDefs, resolvers });

async function startApolloServer() {
  await server.start();
  server.applyMiddleware({ app });
}

startApolloServer();
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
