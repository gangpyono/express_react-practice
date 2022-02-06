// express 앱을 띄우기위한 기능들 정의
import express from "express";
import { ApolloServer } from "apollo-server-express";
import cors from "cors";

const app = express();

app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);

//rest api 서버는 사용자가 요청한 route에 따라 그에 대응하는 res를 응답값으로 보내주는 형태.
//graphql 서버는 graphql이라는 하나의 path로 요청값을받아 판단후 res로 응답한다. (route가 없다.) "/graphql"

const server = new ApolloServer({
  typeDefs: schema,
  resolvers,
  context: {
    db: {
      // resolvers에 의해 읽혀질 DB
      messages: readDB("messages"),
      users: readDB("users"),
    },
  },
});

server.applyMiddleware({
  app,
  path: "/graphql",
});
